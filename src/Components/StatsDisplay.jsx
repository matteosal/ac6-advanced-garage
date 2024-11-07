import {globPartsData, globPartSlots} from '../Misc/Globals.js';

import StatsRow from './StatsRow.jsx';

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

function getTargetTracking(firearmSpec) {
	return firearmSpecMapping[firearmSpec];
}

function getBoostSpeed(baseSpeed, weight) {
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.6]]
	);
	return baseSpeed * multiplier;
}

function getQBSpeed(baseQBSpeed, weight) {
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
	const res = piecewiseLinear(enOutput - enLoad,
		[[0., 1500.], [1800., 9000.], [3500., 16500.]]
	);
	return res;
}

/**********************************************************************************/

const unitSlots = ['rightArm', 'leftArm', 'rightShoulder', 'leftShoulder'];
const frameSlots = ['head', 'core', 'arms', 'legs'];
const allSlots = unitSlots.concat(frameSlots, ['booster', 'fcs', 'generator']);

function computeAllStats(parts) {

	const {core, arms, legs, booster, generator} = parts;

	const totWeight = sumKeyOver(parts, 'Weight', allSlots);
	const enLoad = sumKeyOver(parts, 'ENLoad', complement(allSlots, 'generator'));

	let baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption;
	if(legs['LegType'] === 'Tank')
		[baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption] = [
			legs['TravelSpeed'],
			legs['HighSpeedPerf'],
			legs['QBReloadTime'],
			legs['QBReloadIdealWeight'],
			legs['QBENConsumption']
		];
	else
		[baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption] = [
			booster['Thrust'] * 6 / 100.,
			booster['QBThrust'] / 50.,
			booster['QBReloadTime'],
			booster['QBReloadIdealWeight'],
			booster['QBENConsumption']
		];

	const enOutput = Math.floor(generator['ENOutput'] * 0.01 * core['GeneratorOutputAdj']);

	const res = {
		'AP': sumKeyOver(parts, 'AP', frameSlots),
		'AntiKineticDefense': sumKeyOver(parts, 'AntiKineticDefense', frameSlots),
		'AntiEnergyDefense': sumKeyOver(parts, 'AntiEnergyDefense', frameSlots),
		'AntiExplosiveDefense': sumKeyOver(parts, 'AntiExplosiveDefense', frameSlots),
		'AttitudeStability': sumKeyOver(parts, 'AttitudeStability', ['head', 'core', 'legs']),
		'AttitudeRecovery': getAttitudeRecovery(totWeight),
		'TargetTracking': getTargetTracking(parts.arms.FirearmSpecialization),
		'BoostSpeed': getBoostSpeed(baseSpeed, totWeight),
		'QBSpeed': getQBSpeed(baseQBSpeed, totWeight),
		'QBENConsumption': 
			baseQBENConsumption * (2 - core['BoosterEfficiencyAdj']/100.),
		'QBReloadTime': getQBReloadTime(baseQBReloadTime, baseQBIdealWeight, totWeight),
		'ENCapacity': generator['ENCapacity'],
		'ENSupplyEfficiency': getENSupplyEfficiency(enOutput, enLoad),
		'ENRechargeDelay': 
			1000. / generator['ENRecharge'] * (2 - core['GeneratorSupplyAdj']/100.),
		'TotalWeight': totWeight,
		'TotalArmsLoad': sumKeyOver(parts, 'Weight', ['rightArm', 'leftArm']),
		'ArmsLoadLimit': arms['ArmsLoadLimit'],
		'TotalLoad': sumKeyOver(parts, 'Weight', complement(allSlots, 'legs')),
		'LoadLimit': legs['LoadLimit'],
		'TotalENLoad': enLoad,
		'ENOutput': enOutput
		}
	return res;
}

/**********************************************************************************/

const StatsDisplay = ({acParts}) => {
	const stats = computeAllStats(acParts.current);
	if(acParts.preview === null) {
		let nullStats = Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, null]));
		var [leftStats, rightStats] = [nullStats, stats];
	}
	else {
		var previewStats = computeAllStats(acParts.preview);
		var [leftStats, rightStats] = [stats, previewStats];
	}

	const style = {
		display: 'inline-block',
		verticalAlign: 'top',
		margin: '0px 0px 0px 30px'
	}

	return (
		<div style={style}>
		<table style={{borderSpacing: '0px'}}>
		<tbody>
		{
			Object.keys(stats).map(
				name => <StatsRow 
					name = {name}
					left = {leftStats[name]}
					right = {rightStats[name]} 
					key = {name}
				/>
			)
		}
		</tbody>
		</table>
		</div>
	);
}

export default StatsDisplay;