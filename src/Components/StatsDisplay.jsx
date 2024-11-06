import {globPartsData, globPartSlots, round} from '../Misc/Globals.js'

/**********************************************************************************/

function complement(arr1, arr2) {
	return arr1.filter(elem => !arr2.includes(elem))
}

function sumKeyOver(parts, key, slots) {
	return slots.map(slot => parts[slot]).reduce(
		(acc, current) => acc + current[key],
		0
	)
}

// returns slope and intercept of a line passing through points [x1, y1] and [x2, y2]
function lineParameters([[x1, y1], [x2, y2]]) {
	return [(y1 - y2) / (x1 - x2), (x2*y1 - x1*y2) / (x2 - x1)]
}

function piecewiseLinear(x, breakpoints) {
	const lastPos = breakpoints.length - 1

	if(x < breakpoints[0][0]) {
		return breakpoints[0][1]
	} else if (x >= breakpoints[lastPos][0]) {
		return breakpoints[lastPos][1]
	}

	let result = null
	for (let i = 1; i < lastPos + 1; i++) {
		if (i < breakpoints[i][0]) {
			const [m, q] = lineParameters(breakpoints.slice(i - 1, i + 1))
			result = m * x + q
			break;
		}
	}

	return result
}

/**********************************************************************************/

function getAttitudeRecovery(weight) {
	const base = 100
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4, 1.5], [6, 1.2], [8, 0.9], [11, 0.6], [14, 0.57]]
	)
	return round(base * multiplier)
}

const firearmSpecMapping = {26:41, 45:72, 53:80, 76:85, 80:86, 87:87, 88:87, 92:88, 95:89, 
	96:89, 100:90, 102:90, 103:90, 104:90, 122:94, 123:94, 128:95, 133:96, 135:97, 136:97, 
	140:98, 160:104}

function getTargetTracking(firearmSpec) {
	return firearmSpecMapping[firearmSpec]
}

function getBoostSpeed(baseSpeed, weight) {
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.6]]
	)
	return round(baseSpeed * multiplier)
}

function getQBSpeed(baseQBSpeed, weight) {
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]]
	)
	return round(baseQBSpeed * multiplier)
}

function getQBReloadTime(baseReloadTime, idealWeight, weight) {
	const multiplier = piecewiseLinear(
		(weight - idealWeight) / 10000., 
		[[0, 1], [0.5, 1.1], [1, 1.3], [3, 3], [5, 3.5]]
	)
	return round(baseReloadTime * multiplier, 0.1)
}

function getENSupplyEfficiency(enOutput, enLoad) {
	const res = piecewiseLinear(enOutput - enLoad,
		[[0., 1500.], [1800., 9000.], [3500., 16500.]]
	)
	return round(res)
}

/**********************************************************************************/

const unitSlots = ['rightArm', 'leftArm', 'rightShoulder', 'leftShoulder']
const frameSlots = ['head', 'core', 'arms', 'legs']
const allSlots = unitSlots.concat(frameSlots, ['booster', 'fcs', 'generator'])

function computeAllStats(parts) {

	const {core, arms, legs, booster, generator} = parts

	const totWeight = sumKeyOver(parts, 'Weight', allSlots)
	const enLoad = sumKeyOver(parts, 'ENLoad', complement(allSlots, 'generator'))

	let baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption
	if(legs['LegType'] === 'Tank')
		[baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption] = [
			legs['TravelSpeed'],
			legs['HighSpeedPerf'],
			legs['QBReloadTime'],
			legs['QBReloadIdealWeight'],
			legs['QBENConsumption']
		]
	else
		[baseSpeed, baseQBSpeed, baseQBReloadTime, baseQBIdealWeight, baseQBENConsumption] = [
			booster['Thrust'] * 6 / 100.,
			booster['QBThrust'] / 50.,
			booster['QBReloadTime'],
			booster['QBReloadIdealWeight'],
			booster['QBENConsumption']
		]

	const enOutput = Math.floor(generator['ENOutput'] * 0.01 * core['GeneratorOutputAdj']);

	const res = {
		'AP': sumKeyOver(parts, 'AP', frameSlots),
		'Anti-Kinetic Defense': sumKeyOver(parts, 'AntiKineticDefense', frameSlots),
		'Anti-Energy Defense': sumKeyOver(parts, 'AntiEnergyDefense', frameSlots),
		'Anti-Explosive Defense': sumKeyOver(parts, 'AntiExplosiveDefense', frameSlots),
		'Attitude Stability': sumKeyOver(parts, 'AttitudeStability', ['head', 'core', 'legs']),
		'Attitude Recovery': getAttitudeRecovery(totWeight),
		'Target Tracking': getTargetTracking(parts.arms.FirearmSpecialization),
		'Boost Speed': getBoostSpeed(baseSpeed, totWeight),
		'QB Speed': getQBSpeed(baseQBSpeed, totWeight),
		'QB EN Consumption': 
			round(baseQBENConsumption * (2 - core['BoosterEfficiencyAdj']/100.)),
		'QB Reload Time': getQBReloadTime(baseQBReloadTime, baseQBIdealWeight, totWeight),
		'EN Capacity': generator['ENCapacity'],
		'EN Supply Efficiency': getENSupplyEfficiency(enOutput, enLoad),
		'EN Recharge Delay': 
			round(1000. / generator['ENRecharge'] * (2 - core['GeneratorSupplyAdj']/100.), 0.01),
		'Total Weight': totWeight,
		'Total Arms Load': sumKeyOver(parts, 'Weight', ['rightArm', 'leftArm']),
		'Arms Load Limit': arms['ArmsLoadLimit'],
		'Total Load': sumKeyOver(parts, 'Weight', complement(allSlots, 'legs')),
		'Load Limit': legs['LoadLimit'],
		'Total EN Load': enLoad,
		'EN Output': enOutput
		}
	return res
}

/**********************************************************************************/

const StatsDisplay = ({assemblyParts, previewAssemblyParts}) => {
	const stats = computeAllStats(assemblyParts)
	if(previewAssemblyParts === null) 
		var previewStats = Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, 0]))
	else
		var previewStats = computeAllStats(previewAssemblyParts)

	return (
		<div style={{display: 'inline-block', verticalAlign: 'top', margin: '30px'}}>
		<table>
		<tbody>
		{
			Object.entries(stats).map(
				([prop, val]) => {
					return (
					<tr key={prop}>
						<td>{prop}</td>
						<td>{previewStats[prop]}</td>
						<td>{val}</td>
					</tr>
					)
				}
			)
		}
		</tbody>
		</table>
		</div>
	)
}

export default StatsDisplay