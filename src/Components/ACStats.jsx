import * as glob from '../Misc/Globals.js';
import {StatRowGroup} from './StatRows.jsx';

/**********************************************************************************/

function complement(arr1, arr2) {
	return arr1.filter(elem => !arr2.includes(elem));
}

function sumKeyOver(parts, key, slots) {
	return slots.map(slot => parts[slot]).reduce(
		(acc, current) => acc + current[key],
		0
	);
}

// returns slope and intercept of a line passing through points [x1, y1] and [x2, y2]
function lineParameters([[x1, y1], [x2, y2]]) {
	return [(y1 - y2) / (x1 - x2), (x2*y1 - x1*y2) / (x2 - x1)];
}

function piecewiseLinear(x, breakpoints) {
	const lastPos = breakpoints.length - 1;

	if(x < breakpoints[0][0]) {
		return breakpoints[0][1];
	} else if (x >= breakpoints[lastPos][0]) {
		return breakpoints[lastPos][1];
	}

	let result = null;
	for (let i = 1; i < lastPos + 1; i++) {
		if (x < breakpoints[i][0]) {
			const [m, q] = lineParameters(breakpoints.slice(i - 1, i + 1))
			result = m * x + q
			break;
		}
	}

	return result;
}

/**********************************************************************************/

function getAttitudeRecovery(weight) {
	const base = 100;
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4, 1.5], [6, 1.2], [8, 0.9], [11, 0.6], [14, 0.57]]
	);
	return base * multiplier;
}

function getTargetTracking(firearmSpec, loadRatio) {
	let result = 100 * piecewiseLinear(firearmSpec,
		[[0., 0.], [50., 0.8], [100., 0.9], [150., 1.], [200., 1.2]]
	)
	if(loadRatio > 1)
		result *= piecewiseLinear(loadRatio, [[1., 1.], [1.2, 0.5], [1.21, 0.3], [2., 0.05]]);
	return result;
}

const mod = (a, b) => ((a % b) + b) % b;
const generateShots = (nShots, interval, offset, recoil) => [...Array(nShots).keys()].map(
	i => [i * interval + offset, recoil]
);
const maxSimulationTime = 5;
const simulationShotOffset = 0.05;
const recoilExcludedUnits = ['FASAN/60E', 'VE-60LCA', 'VE-60LCB', 'VP-60LCD', 'VP-60LCS'];
// ^ These have both RapidFire and Recoil but arm weapons stop firing when they fire so they
// mess things up in the simulation
function getAverageRecoil(units, recoilControl) {

	if(units.length === 0)
		return 0;

	const recoilMult = piecewiseLinear(recoilControl, [[0, 1.2], [150, 0.9], [235, 0.8]]);
	const reductionRate = piecewiseLinear(recoilControl,
		[[0, 10], [50, 60], [100, 80], [150, 160], [235, 200]]
	);
	const reductionDelay = recoilControl === 45 ? 0.095 : 0.05;

	const simulationTime = Math.min(
		Math.max.apply(Math, units.map(u => u['MagDumpTime'])),
		maxSimulationTime
	);

	// shotsByUnit has dimensions [nUnits, nShots(unit), 2] where the last dimension contains
	// pairs [shotTime, shotRecoil]. Shot times for different units are arbitrarily offset by 
	// multiples of simulationShotOffset to mimic the fact that triggers are not pressed at
	// the exact same time
	const shotsByUnit = Array(units.length);
	for(let i = 0; i < units.length; i++) {
		const cycleTime = units[i]['MagDumpTime'] + units[i]['ReloadTime'];
		const nFullCycles = Math.floor(simulationTime / cycleTime);
		const lastCycleNShots = Math.min(
			units[i]['MagazineRounds'],
			Math.floor(units[i]['RapidFire'] * mod(simulationTime, cycleTime))
		);
		shotsByUnit[i] = [];
		for(let cycle = 0; cycle < nFullCycles; cycle++) {
			shotsByUnit[i] = shotsByUnit[i].concat(
				generateShots(
					units[i]['MagazineRounds'],
					1 / units[i]['RapidFire'],
					cycle * cycleTime + i * simulationShotOffset,
					units[i]['Recoil'] * recoilMult
				)
			);
		}
		shotsByUnit[i] = shotsByUnit[i].concat(
			generateShots(
				lastCycleNShots,
				1 / units[i]['RapidFire'],
				nFullCycles * cycleTime + i * simulationShotOffset,
				units[i]['Recoil'] * recoilMult
			)
		)
	}
	let mergedShots = shotsByUnit.flat();
	mergedShots.sort((a, b) => a[0] - b[0]);

	// shotWindows contains time windows between shots with recoil added by the shot:
	// [[timeBetweenShot1And2, recoilShot1], [timeBetweenShot2And3, recoilShot2], ...]
	let shotWindows = Array(mergedShots.length - 1);
	for(let i = 0; i < shotWindows.length; i++) {
		shotWindows[i] = [mergedShots[i + 1][0] - mergedShots[i][0], mergedShots[i][1]]
	}

	// Compute the integral mean of the accumulated recoil across all the shot windows
	let recoilIntegral = 0;
	shotWindows.reduce(
		(startRecoil, val, pos) => {
			// Compute value of recoil at the end of the window
			const fullWindow = shotWindows[pos][0];
			const postShotRecoil = Math.min(100, startRecoil + shotWindows[pos][1]);
			const reductionWindow = Math.max(0, fullWindow - reductionDelay);
			const endRecoil = Math.max(0, 
				postShotRecoil - reductionWindow * reductionRate
			);

			// Save the integral of the recoil across the window
			const decreaseWindow = Math.min(reductionWindow, postShotRecoil / reductionRate);
			// ^ window where recoil is actually decreasing (might hit 0 before the end of
			// reductionWindow)
			recoilIntegral +=
				postShotRecoil * Math.min(reductionDelay, fullWindow) + decreaseWindow * 
				(postShotRecoil - 0.5 * reductionRate * decreaseWindow);

			return endRecoil;
		},
		0
	);
	const realMaxTime = mergedShots[mergedShots.length - 1][0];
	return recoilIntegral / realMaxTime;
}

const boostBreakpoints = [[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.65]];
const overweightBreakpoints = 
	[[1., 1.], [1.05, 0.95], [1.1, 0.8], [1.3, 0.75], [1.5, 0.7]];

const speedBreakpoints = {
	boostGrounded: [boostBreakpoints, overweightBreakpoints],
	boostGroundedFortaleza: [
		[[5, 1], [6.25, 0.94], [7.5, 0.86], [10, 0.75], [15, 0.6]],
		overweightBreakpoints
	],
	boostGroundedTank: [
		[[5, 1], [7.5, 0.9], [10, 0.85], [12, 0.8], [14, 0.7]],
		overweightBreakpoints
	],
	boostAerial: [boostBreakpoints, overweightBreakpoints],
	quickBoost: [
		[[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]],
		overweightBreakpoints
	],
	upwards: [
		[[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]],
		overweightBreakpoints
	],
	assaultBoost: [
		[[4., 1.], [5, 0.95], [7.5, 0.9], [10, 0.7], [15, 0.55]],
		overweightBreakpoints
	],
	meleeBoost: [
		[[4., 1.], [6.25, 0.95], [7.5, 0.85], [8, 0.75], [12, 0.65]],
		overweightBreakpoints
	],
	hover: [
		[[7., 1.], [9, 0.9], [10, 0.85], [11, 0.75], [12, 0.7]],
		[[1., 1.], [1.05, 0.9], [1.1, 0.8], [1.3, 0.7], [1.5, 0.6]]
	]
}

function getSpeedSpec(base, weight, loadRatio, breakpointsMult, breakpointsOver) {
	let multiplier = piecewiseLinear(weight / 10000., breakpointsMult);
	if(loadRatio > 1)
		multiplier *= piecewiseLinear(loadRatio, breakpointsOver);
	return base * multiplier
}

function getQBReloadTime(baseReloadTime, idealWeight, weight) {
	const multiplier = piecewiseLinear(
		(weight - idealWeight) / 10000., 
		[[0, 1], [0.5, 1.1], [1, 1.3], [3, 3], [5, 3.5]]
	);
	return baseReloadTime * multiplier;
}

function getENSupplyEfficiency(enOutput, enLoad) {
	if(enLoad > enOutput)
		return 100;
	const res = piecewiseLinear(enOutput - enLoad,
		[[0., 1500.], [1800., 9000.], [3500., 16500.]]
	);
	return res;
}

function getRechargeDelays(generator, core) {
	const factor = (2 - core['GeneratorSupplyAdj']/100.);
	return Object.fromEntries(
		[['normal', 'ENRecharge'], ['redline', 'SupplyRecovery']].map(
			([key, prop]) => [key, 1000 / generator[prop] * factor]
		)
	)
}

function timeToRecoverEnergy(energy, supplyEff, delay) {
	return energy / supplyEff + delay;
}

function getUnitRangesData(units, fcs) {
	let res = units.map(unit => unit['IdealRange'] || unit['EffectiveRange'] || null);
	return res.concat(
		[fcs['CloseRangeAssist'], fcs['MediumRangeAssist'], fcs['LongRangeAssist']]
	)
}

/**********************************************************************************/

const unitSlots = ['rightArm', 'leftArm', 'rightBack', 'leftBack'];
const frameSlots = ['head', 'core', 'arms', 'legs'];
const innerSlots = ['booster', 'fcs', 'generator'];
const allSlots = unitSlots.concat(frameSlots, innerSlots);

function computeAllStats(parts) {

	const {core, arms, legs, booster, fcs, generator} = parts;
	const units = unitSlots.map(s => parts[s]);

	const weightPerGroup = [unitSlots, frameSlots, innerSlots].map(
		slots => sumKeyOver(parts, 'Weight', slots)
	); // [units, slots, inner parts]
	const enLoadPerGroup = [unitSlots, frameSlots, complement(innerSlots, 'generator')].map(
		slots => sumKeyOver(parts, 'ENLoad', slots)
	); // [units, slots, inner parts]
	const weight = glob.total(weightPerGroup);

	const ap = sumKeyOver(parts, 'AP', frameSlots);
	const defense = {
		kinetic: sumKeyOver(parts, 'AntiKineticDefense', frameSlots),
		energy: sumKeyOver(parts, 'AntiEnergyDefense', frameSlots),
		explosive: sumKeyOver(parts, 'AntiExplosiveDefense', frameSlots)
	}
	const effectiveAP = Object.fromEntries(
		['kinetic', 'energy', 'explosive'].map(t => [t, ap * defense[t] / 1000])
	);

	let baseBoostSpeed;
	let boosterSrcPart;
	if(legs['LegType'] === 'Tank') {
		baseBoostSpeed = legs['HighSpeedPerf'];
		boosterSrcPart = legs;
	} else {
		baseBoostSpeed = booster['Thrust'] * 6 / 100.;
		boosterSrcPart = booster;
	}

	const baseSpeedValues = {
		boostAerial: baseBoostSpeed,
		quickBoost: boosterSrcPart['QBThrust'] / 50.,
		upwards: boosterSrcPart['UpwardThrust'] * 6 / 100,
		assaultBoost: boosterSrcPart['ABThrust'] * 6 / 100,
		meleeBoost: boosterSrcPart['MeleeAttackThrust'] * 6.3 / 100,
		hover: legs['BaseHoverSpeed'] ? legs['BaseHoverSpeed'] : 0
	};
	let boostSpeedKey;
	if(legs['Name'] === 'EL-TL-11 FORTALEZA')
		boostSpeedKey = 'boostGroundedFortaleza';
	else if(['VE-42B', 'LG-022T BORNEMISSZA'].includes(legs['Name']))
		boostSpeedKey = 'boostGroundedTank';
	else
		boostSpeedKey = 'boostGrounded';
	baseSpeedValues[boostSpeedKey] = baseBoostSpeed;

	const loadRatio = (weight - legs['Weight']) / legs['LoadLimit'];
	const speedValues = Object.fromEntries(
		Object.keys(baseSpeedValues).map(key => {
			const [bpMult, bpOver] = speedBreakpoints[key];
			const val = getSpeedSpec(baseSpeedValues[key], weight, loadRatio, bpMult, bpOver);
			return [key, val]
		})
	);

	const [baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption, qbJetDuration] = 
		['QBReloadTime', 'QBReloadIdealWeight', 'QBENConsumption', 'QBJetDuration'].map(
			name => boosterSrcPart[name]
		);

	const qbReloadTime = getQBReloadTime(baseQBReloadTime, baseQBIdealWeight, weight);
	const qbENConsumption = baseQBENConsumption * (2 - core['BoosterEfficiencyAdj'] / 100.);

	const enCapacity = generator['ENCapacity'];
	const enOutput = Math.floor(generator['ENOutput'] * 0.01 * core['GeneratorOutputAdj']);
	const enLoad = glob.total(enLoadPerGroup);
	const enSupplyEfficiency = getENSupplyEfficiency(enOutput, enLoad);
	const enRechargeDelay = getRechargeDelays(generator, core);
	const postRecENSupply = generator['PostRecoveryENSupply'];

	const fullRechargeTime = timeToRecoverEnergy(enCapacity, enSupplyEfficiency,
		enRechargeDelay.normal);
	const fullRechargeTimeRedline = timeToRecoverEnergy(
		enCapacity - postRecENSupply,
		enSupplyEfficiency,
		enRechargeDelay.redline
	);
	const qbENRechargeTime = qbJetDuration + timeToRecoverEnergy(
		qbENConsumption,
		enSupplyEfficiency,
		enRechargeDelay.normal
	);

	const armsLoad = sumKeyOver(parts, 'Weight', ['rightArm', 'leftArm']);
	const legsLoad = sumKeyOver(parts, 'Weight', complement(allSlots, 'legs'));

	const recoilUnits = units.filter(u => 
		u['Recoil'] && u['RapidFire'] && !recoilExcludedUnits.includes(u['Name'])
	);
	const avgRecoil = getAverageRecoil(recoilUnits, arms['RecoilControl']);

	return [
		[
			{name: 'AP', value: ap},
			{name: 'AntiKineticDefense', value: defense.kinetic},
			{name: 'AntiEnergyDefense', value: defense.energy},
			{name: 'AntiExplosiveDefense', value: defense.explosive},
			{name: 'AttitudeStability', value: 
				sumKeyOver(parts, 'AttitudeStability', ['head', 'core', 'legs'])},
			{name: 'AttitudeRecovery', value: getAttitudeRecovery(weight)},
			{name: 'EffectiveAPKinetic', value: effectiveAP.kinetic},
			{name: 'EffectiveAPEnergy', value: effectiveAP.energy},
			{name: 'EffectiveAPExplosive', value: effectiveAP.explosive},
			{name: 'EffectiveAPAvg', value: glob.mean(Object.values(effectiveAP))}
		],
		[
			{name: 'TargetTracking',
				value: getTargetTracking(
					arms['FirearmSpecialization'],
					armsLoad / arms['ArmsLoadLimit']
				)
			},
			{name: 'AimAssistProfile', value: getUnitRangesData(units, fcs), type: 'RangePlot'},
			{name: 'AverageRecoil', value: avgRecoil}
		],
		[
			{name: 'GroundedBoostSpeed', value: speedValues[boostSpeedKey]},
			{name: 'AerialBoostSpeed', value: speedValues.boostAerial},
			{name: 'QBSpeed', value: speedValues.quickBoost},
			{name: 'QBENConsumption', value: qbENConsumption},
			{name: 'QBReloadTime', value: qbReloadTime},
			{name: 'MaxConsecutiveQB', value: Math.ceil(enCapacity / qbENConsumption)},
			{name: 'UpwardSpeed', value: speedValues.upwards},
			{name: 'AssaultBoostSpeed', value: speedValues.assaultBoost},
			{name: 'MeleeBoostSpeed', value: speedValues.meleeBoost},
			{name: 'HoverSpeed', value: speedValues.hover}
		],
		[
			{name: 'ENCapacity', value: enCapacity},
			{name: 'ENSupplyEfficiency', value: enSupplyEfficiency},
			{name: 'ENRechargeDelay', value: enRechargeDelay.normal},
			{name: 'ENRechargeDelayRedline', value: enRechargeDelay.redline},
			{name: 'QBENRechargeTime', value: qbENRechargeTime},
			{name: 'FullRechargeTime', value: fullRechargeTime},
			{name: 'FullRechargeTimeRedline', value: fullRechargeTimeRedline},
			{name: 'ENRecoveryProfiles', 
				value: {
					normal: 
						[enRechargeDelay.normal, 0, enSupplyEfficiency, enCapacity],
					redline: 
						[enRechargeDelay.redline, postRecENSupply, enSupplyEfficiency, enCapacity]
				},
				type: 'EnergyPlot'
			}
		],
		[
			{name: 'TotalWeight', value: weight},
			{name: 'TotalArmsLoad', value: armsLoad},
			{name: 'ArmsLoadLimit', value: arms['ArmsLoadLimit']},
			{name: 'TotalLoad', value: legsLoad},
			{name: 'LoadLimit', value: legs['LoadLimit']},
			{name: 'TotalENLoad', value: enLoad},
			{name: 'ENOutput', value: enOutput},		
			{name: "CurrentLoad", value: legsLoad, type: 'BarOnly', limit: legs['LoadLimit']},
			{name: "CurrentArmsLoad", value: armsLoad, type: 'BarOnly', 
				limit: arms['ArmsLoadLimit']},
			{name: "CurrentENLoad", value: enLoad, type: 'BarOnly', limit: enOutput},
			{name: 'WeightByGroup', value: weightPerGroup.map(x => 100. * x / weight), 
				type: 'ProportionBar'},
			{name: 'ENLoadByGroup', value: enLoadPerGroup.map(x => 100. * x / enLoad), 
				type: 'ProportionBar'}
		]
	]
}

/**********************************************************************************/

function toNullStat(stat) {
	if(stat.type === 'EmptyLine')
		return {type: 'EmptyLine'}
	else
		return {name: stat.name, value: null}
}

function findStatValue(stats, statName) {
	return stats.find(stat => stat.name === statName).value
}

function getOverloadTable(stats) {
	// Not optimal, we are searching these fields in the list but we could just return
	// them directly from computeAllStats
	const load = findStatValue(stats, 'TotalLoad');
	const loadLimit = findStatValue(stats, 'LoadLimit');
	const armsLoad = findStatValue(stats, 'TotalArmsLoad');
	const armsLoadLimit = findStatValue(stats, 'ArmsLoadLimit');
	const enLoad = findStatValue(stats, 'TotalENLoad');
	const enLoadLimit = findStatValue(stats, 'ENOutput');

	const isAboveLoad = load > loadLimit;
	const isAboveArmsLoad = armsLoad > armsLoadLimit;
	const isAboveENLoad = enLoad > enLoadLimit;

	return (
		{'TotalLoad': isAboveLoad, 'LoadLimit': isAboveLoad, 
			'CurrentLoad': isAboveLoad, 'TotalArmsLoad': isAboveArmsLoad, 
			'ArmsLoadLimit': isAboveArmsLoad, 'CurrentArmsLoad': isAboveArmsLoad, 
			'TotalENLoad': isAboveENLoad, 'ENOutput': isAboveENLoad, 'CurrentENLoad': isAboveENLoad
		}
	)	
}

const groupNames = ['DURABILITY', 'TARGETING', 'MOBILITY', 'ENERGY', 'LIMITS'];

const limitGroupPos = groupNames.indexOf('LIMITS');

// Returns all the stats that are present in reference, taking their value from toFilter.
// If a stat is only present in reference the value is undefined
function filterStats(toFilter, reference) {
	return reference.map(
		(rGroup, rGroupPos) => rGroup.map(
			rStat => {
				const match = toFilter[rGroupPos].find(
					curStat => curStat.name === rStat.name
				);
				if(match !== undefined)
					return match
				else
					return {...rStat, ...{value: undefined}}
			}
		)
	);
}

const ACStats = ({acParts, comparedParts, buildCompareMode}) => {

	let leftStats, rightStats;
	const currentStats = computeAllStats(acParts);
	if(comparedParts === null) {
		const nullStats = currentStats.map(group => group.map(stat => toNullStat(stat)));
		[leftStats, rightStats] = [nullStats, currentStats];
	}
	else {
		const comparedStats = computeAllStats(comparedParts);
		if(buildCompareMode)
			[leftStats, rightStats] = [comparedStats, currentStats];
		else
			[leftStats, rightStats] = [currentStats, comparedStats];
		leftStats = filterStats(leftStats, rightStats);
	}

	const groupRange = [...Array(groupNames.length).keys()];

	const overloadTable = getOverloadTable(rightStats[limitGroupPos]);

	return (
		<div style={
			{
				...{boxSizing: 'border-box', height: '100%', padding: '15px 15px'},				
				...glob.dottedBackgroundStyle()
			}
		}>
			<div style={{fontSize: '12px', padding: '0px 0px 10px 10px'}}>
				{glob.boxCharacter + ' AC SPECS'}
			</div>
			<div className="my-scrollbar" style={{height: '95%', overflowY: 'auto'}}>
				{
					groupRange.map(
						outerPos => <StatRowGroup
							header={groupNames[outerPos]}
							leftGroup={leftStats[outerPos]}
							rightGroup={rightStats[outerPos]}
							overloadTable={outerPos === limitGroupPos ? overloadTable : null}
							buildCompareMode={buildCompareMode}
							key={outerPos}
						/>
					)
				}
			</div>
		</div>
	);
}

export default ACStats;