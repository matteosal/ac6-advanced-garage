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

const firearmSpecMapping = {26:41, 45:72, 53:80, 76:85, 80:86, 87:87, 88:87, 92:88, 95:89, 
	96:89, 100:90, 102:90, 103:90, 104:90, 122:94, 123:94, 128:95, 133:96, 135:97, 136:97, 
	140:98, 160:104};

function getTargetTracking(firearmSpec, load, limit) {
	if(load > limit)
		// Still need to figure out what's the penalty in this case
		return 0;
	else
		return firearmSpecMapping[firearmSpec];
}

function getBoostSpeed(baseSpeed, weight, limit) {
	if(weight > limit) 
		// Still need to figure out what's the penalty in this case
		return 0.
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.65]]
	);
	return baseSpeed * multiplier;
}

function getQBSpeed(baseQBSpeed, weight, limit) {
	if(weight > limit) 
		// Still need to figure out what's the penalty in this case
		return 0.
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]]
	);
	return baseQBSpeed * multiplier;
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

	let baseSpeed;
	let srcPart;
	if(legs['LegType'] === 'Tank') {
		baseSpeed = legs['HighSpeedPerf'];
		srcPart = legs;
	} else {
		baseSpeed = booster['Thrust'] * 6 / 100.;
		srcPart = booster;
	}
	const baseQBSpeed = srcPart['QBThrust'] / 50.;
	const [baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption, qbJetDuration] = 
		['QBReloadTime', 'QBReloadIdealWeight', 'QBENConsumption', 'QBJetDuration'].map(
			name => srcPart[name]
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

	let targetingStats = [
		{name: 'TargetTracking', value: 
			getTargetTracking(arms['FirearmSpecialization'], armsLoad, arms['ArmsLoadLimit'])}
	];

	const lockTimeNames = ['RightArmMissileLockTime', 'LeftArmMissileLockTime', 
		'RightBackMissileLockTime', 'LeftBackMissileLockTime'];
	units.map((unit, pos) => unit['HomingLockTime'] ?
		targetingStats.push(
			{
				name: lockTimeNames[pos],
				value: unit['HomingLockTime'] * (2 - fcs['MissileLockCorrection'] / 100.)
			}
		) : 
		null
	);

	targetingStats.push(
		{name: 'AimAssistProfile',
			value: getUnitRangesData(units, fcs),
			type: 'RangePlot'
		}
	);

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
		targetingStats,
		[
			{name: 'BoostSpeed', value: 
				getBoostSpeed(baseSpeed, weight, legs['LoadLimit'] + legs['Weight'])},
			{name: 'QBSpeed', value: 
				getQBSpeed(baseQBSpeed, weight, legs['LoadLimit'] + legs['Weight'])},
			{name: 'QBENConsumption', value: qbENConsumption},
			{name: 'QBReloadTime', value: qbReloadTime},
			{name: 'MaxConsecutiveQB', value: 
				Math.ceil(enCapacity / qbENConsumption)}
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

const ACStats = ({acParts, preview, hideLeft}) => {

	let leftStats, rightStats;
	const currentStats = computeAllStats(acParts);
	if(preview.part === null) {
		const nullStats = currentStats.map(group => group.map(stat => toNullStat(stat)));
		[leftStats, rightStats] = [nullStats, currentStats];
	}
	else {
		const previewACParts = {...acParts};
		previewACParts[preview.slot] = preview.part;
		if(
			previewACParts.legs['LegType'] !== 'Tank' && 
			previewACParts.booster['ID'] === glob.noneBooster['ID']
		) {
			// This happens when the current AC has tank legs and the preview has non-tank legs
			previewACParts.booster = glob.defaultBooster;
		}
		rightStats = computeAllStats(previewACParts);
		// just like part stats, left stats should have all the stats from right stats in the 
		// same order, with a value of undefined if the left stat is missing.
		leftStats = rightStats.map(
			(rGroup, rGroupPos) => rGroup.map(
				rStat => {
					const match = currentStats[rGroupPos].find(
						curStat => curStat.name === rStat.name
					);
					if(match !== undefined)
						return match
					else
						return {...rStat, ...{value: undefined}}
				}
			)
		)
	}

	const groupRange = [...Array(groupNames.length).keys()];

	const overloadTable = getOverloadTable(rightStats[limitGroupPos]);

	return (
		<div style={
			{
				...{height: '775px', padding: '15px 15px'},				
				...glob.dottedBackgroundStyle()
			}
		}>
			<div style={{fontSize: '12px', padding: '0px 0px 10px 10px'}}>
				{glob.boxCharacter + ' AC SPECS'}
			</div>
			<div className="my-scrollbar" style={{height: '740px', overflowY: 'auto'}}>
				{
					groupRange.map(
						outerPos => <StatRowGroup
							header={groupNames[outerPos]}
							leftGroup={leftStats[outerPos]}
							rightGroup={rightStats[outerPos]}
							overloadTable={outerPos === limitGroupPos ? overloadTable : null}
							hideLeft={hideLeft}
							key={outerPos}
						/>
					)
				}
			</div>
		</div>
	);
}

export default ACStats;