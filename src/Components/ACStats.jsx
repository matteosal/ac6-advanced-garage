import { useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {ACPartsContext} from "../Contexts/ACPartsContext.jsx";
import * as statRows from './StatRows.jsx';

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
		if (i < breakpoints[i][0]) {
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
		[[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.6]]
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

/**********************************************************************************/

const unitSlots = ['rightArm', 'leftArm', 'rightBack', 'leftBack'];
const frameSlots = ['head', 'core', 'arms', 'legs'];
const innerSlots = ['booster', 'fcs', 'generator'];
const allSlots = unitSlots.concat(frameSlots, innerSlots);

function computeAllStats(parts) {

	const {core, arms, legs, booster, generator} = parts;

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

	let baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption,
		qbJetDuration;
	if(legs['LegType'] === 'Tank')
		[baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption,
			qbJetDuration] = [
			legs['TravelSpeed'],
			legs['HighSpeedPerf'],
			legs['QBReloadTime'],
			legs['QBReloadIdealWeight'],
			legs['QBENConsumption'],
			legs['QBJetDuration']
		];
	else
		[baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption,
			qbJetDuration] = [
			booster['Thrust'] * 6 / 100.,
			booster['QBThrust'] / 50.,
			booster['QBReloadTime'],
			booster['QBReloadIdealWeight'],
			booster['QBENConsumption'],
			booster['QBJetDuration']
		];
	const qbReloadTime = getQBReloadTime(baseQBReloadTime, baseQBIdealWeight, weight);
	const qbENConsumption = baseQBENConsumption * (2 - core['BoosterEfficiencyAdj'] / 100.);

	const enOutput = Math.floor(generator['ENOutput'] * 0.01 * core['GeneratorOutputAdj']);
	const enLoad = glob.total(enLoadPerGroup);
	const enSupplyEfficiency = getENSupplyEfficiency(enOutput, enLoad);
	const enRechargeDelay = getRechargeDelays(generator, core);

	const fullRechargeTime = timeToRecoverEnergy(generator['ENCapacity'], enSupplyEfficiency,
		enRechargeDelay.normal);
	const fullRechargeTimeRedline = timeToRecoverEnergy(
		generator['ENCapacity'] - generator['PostRecoveryENSupply'],
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

	return [
		{name: 'AP', value: ap},
		{name: 'AntiKineticDefense', value: defense.kinetic},
		{name: 'AntiEnergyDefense', value: defense.energy},
		{name: 'AntiExplosiveDefense', value: defense.explosive},
		{name: 'AttitudeStability', value: sumKeyOver(parts, 'AttitudeStability', ['head', 'core', 'legs'])},
		{name: 'AttitudeRecovery', value: getAttitudeRecovery(weight)},
		{name: 'EffectiveAPKinetic', value: effectiveAP.kinetic},
		{name: 'EffectiveAPEnergy', value: effectiveAP.energy},
		{name: 'EffectiveAPExplosive', value: effectiveAP.explosive},
		{name: 'EffectiveAPAvg', value: glob.mean(Object.values(effectiveAP))},
		{type: 'EmptyLine'},
		{name: 'TargetTracking', value: 
			getTargetTracking(arms['FirearmSpecialization'], armsLoad, arms['ArmsLoadLimit'])},
		{type: 'EmptyLine'},
		{name: 'BoostSpeed', value: 
			getBoostSpeed(baseSpeed, weight, legs['LoadLimit'] + legs['Weight'])},
		{name: 'QBSpeed', value: 
			getQBSpeed(baseQBSpeed, weight, legs['LoadLimit'] + legs['Weight'])},
		{name: 'QBENConsumption', value: qbENConsumption},
		{name: 'QBReloadTime', value: qbReloadTime},
		{name: 'MaxConsecutiveQB', value: Math.ceil(generator['ENCapacity'] / qbENConsumption)},
		{type: 'EmptyLine'},
		{name: 'ENCapacity', value: generator['ENCapacity']},
		{name: 'ENSupplyEfficiency', value: enSupplyEfficiency},
		{name: 'ENRechargeDelay', value: enRechargeDelay.normal},
		{name: 'ENRechargeDelayRedline', value: enRechargeDelay.redline},
		{name: 'QBENRechargeTime', value: qbENRechargeTime},
		{name: 'FullRechargeTime', value: fullRechargeTime},
		{name: 'FullRechargeTimeRedline', value: fullRechargeTimeRedline},
		{name: 'ENRecoveryProfiles', 
			value: {
				normal: [enRechargeDelay.normal, 0, enSupplyEfficiency, generator['ENCapacity']],
				redline: [enRechargeDelay.redline, generator['PostRecoveryENSupply'], 
					enSupplyEfficiency, generator['ENCapacity']]
			},
			type: 'Plot'
		},
		{type: 'EmptyLine'},
		{name: 'TotalWeight', value: weight},
		{type: 'EmptyLine'},
		{name: 'TotalArmsLoad', value: armsLoad},
		{name: 'ArmsLoadLimit', value: arms['ArmsLoadLimit']},
		{name: 'TotalLoad', value: legsLoad},
		{name: 'LoadLimit', value: legs['LoadLimit']},
		{name: 'TotalENLoad', value: enLoad},
		{name: 'ENOutput', value: enOutput},
		{type: 'EmptyLine'},
		{name: "CurrentLoad", value: legsLoad, type: 'BarOnly', limit: legs['LoadLimit']},
		{name: "CurrentArmsLoad", value: armsLoad, type: 'BarOnly', 
			limit: arms['ArmsLoadLimit']},
		{name: "CurrentENLoad", value: enLoad, type: 'BarOnly', limit: enOutput},
		{name: 'WeightByGroup', value: weightPerGroup.map(x => 100. * x / weight), 
			type: 'ProportionBar'},
		{name: 'ENLoadByGroup', value: enLoadPerGroup.map(x => 100. * x / enLoad), 
			type: 'ProportionBar'}
	]
}

/**********************************************************************************/

const statTooltips = {
	'EffectiveAPKinetic': 'Amount of raw kinetic damage that can be sustained.',
	'EffectiveAPEnergy': 'Amount of raw energy damage that can be sustained.',
	'EffectiveAPExplosive': 'Amount of raw explosive damage that can be sustained.',
	'EffectiveAPAvg': 'Average of all effective AP values.',
	'MaxConsecutiveQB': 'Maximum number of consecutive quick boosts before running out of \
\	\	energy (assuming no energy is recovered in between quick boosts).',
	'ENRechargeDelayRedline': 'Time before energy starts recovering when the generator is \
\	\	fully depleted.',
	'QBENRechargeTime': 'Time to recovery energy consumed by one quick boost when the \
\	\	generator is not fully depleted.\nNOTE: despite the energy bar depleting immediately \
\	\	when a quick boost is performed, the energy is actually gradually depleted throughout \
\	\	entire quick boost animation. This means that the value of the QB Jet Duration stat is \
\	\	added to the recovery time to compute this value.',
	'FullRechargeTime': 'Time to recover an amount of energy equal to the energy capacity \
\	\	when the generator is not fully depleted.\nNOTE: this is a limit value because if the \
\	\	generator is not fully depleted energy recovery will recover less than the full energy \
\	\	capacity.',
	'FullRechargeTimeRedline': 'Time to fully recover energy when the generator is fully \
\	\	depleted',
	'ENRecoveryProfiles': 'Shows the energy recovered over time in the normal (cyan) and \
\	\	redlining (red) cases. When a part is in preview, the current profiles are shown with \
\	\	dotted lines and the new ones with solid ones.\nNOTE: the cyan profile is a limit \
\	\	case because if the generator is not fully depleted energy recovery will not start \
\	\	from zero energy.',
	'WeightByGroup': 'Shows the contributions of units (left), frame (middle) and inner parts \
\	\	(right) to the total weight.',
	'ENLoadByGroup': 'Shows the contributions of units (left), frame (middle) and inner parts \
\	\	(right) to the total energy load.'
};

/**********************************************************************************/

function toNullStat(stat) {
	if(stat.type === 'EmptyLine')
		return {type: 'EmptyLine'}
	else
		return {name: stat.name, value: null}
}

function switchComponent(leftStat, rightStat, pos) {

	if(rightStat.type === 'EmptyLine')
		return (
				<div style={{padding: '5px 0'}}>&nbsp;</div>
		)
	else if(rightStat.type === 'BarOnly')
		return (
			<statRows.BarOnlyRow
				name = {rightStat.name}
				left = {leftStat.value}
				right = {rightStat.value}
				limit = {rightStat.limit}
				key = {pos}				
			/>
		)
	else if(rightStat.type === 'ProportionBar')
		return(
			<statRows.ProportionBarRow
				name = {rightStat.name}
				left = {leftStat.value}
				right = {rightStat.value}
				tooltip = {statTooltips[rightStat.name]}
				key = {pos}				
			/>		
		)
	else if(rightStat.type === 'Plot') {
		return(
			<statRows.PlotRow
				name={rightStat.name}
				left={leftStat.value}	
				right={rightStat.value}
				tooltip={statTooltips[rightStat.name]}
			/>		
		)		
	}
	else return (
			<statRows.NumericRow
				name = {rightStat.name}
				leftRaw = {leftStat.value}
				rightRaw = {rightStat.value}
				tooltip = {statTooltips[rightStat.name]}
				key = {pos}
			/>
		)
}

const redRowBackground = 'rgb(255, 0, 0, 0.5)'

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

const ACStats = () => {
	const acParts = useContext(ACPartsContext);

	const currentStats = computeAllStats(acParts.current);
	if(acParts.preview === null) {
		let nullStats = currentStats.map(stat => toNullStat(stat));
		var [leftStats, rightStats] = [nullStats, currentStats];
	}
	else {
		var previewStats = computeAllStats(acParts.preview);
		var [leftStats, rightStats] = [currentStats, previewStats];
	}

	const range = [...Array(currentStats.length).keys()];

	const overloadTable = getOverloadTable(rightStats);

	return (
		<div style={
			{
				...{height: '750px', padding: '15px'},				
				...glob.dottedBackgroundStyle()
			}
		}>
			<div style={{fontSize: '12px', padding: '0px 0px 10px 10px'}}>
				{glob.boxCharacter + ' AC SPECS'}
			</div>

			<div className="my-scrollbar" style={{height: '715px', overflowY: 'auto'}}>
				{
					range.map(
						(pos) => {
							let background = overloadTable[rightStats[pos].name] ? 
								redRowBackground : 
								glob.tableRowBackground(pos);
							return(
								<div style={{background: background}} key={pos}>
									{switchComponent(leftStats[pos], rightStats[pos], pos)}
								</div>
							)
						}
					)
				}
			</div>
		</div>
	);
}

export default ACStats;