import {globPartsData, globPartSlots} from '../Misc/Globals.js'

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
	return base * multiplier
}

const firearmSpecMapping = {26: 41, 45: 72, 53: 80, 80: 86, 88: 87, 92: 88, 95: 89, 96: 89, 
	100: 90, 102: 90, 103: 90, 104: 90, 122: 94, 123: 94, 128: 95, 133: 96, 136: 97, 160: 104}

function getTargetTracking(firearmSpec) {
	return firearmSpecMapping[firearmSpec]
}

function getBoostSpeed(baseSpeed, weight) {
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.6]]
	)
	return baseSpeed * multiplier	
}

function getQBSpeed(baseQBSpeed, weight) {
	const multiplier = piecewiseLinear(
		weight / 10000., 
		[[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]]
	)
	return baseQBSpeed * multiplier	
}


function computeQuickBoostSpeed(totalWeight, hiddenBoostValue) {
  let multiplier;

  if (totalWeight <= 40000) {
      multiplier = 1;
  } else if (totalWeight <= 62500) {
      // Linear interpolation between 1 and 0.9
      multiplier = 1.1778 - 0.0444 * totalWeight / 10000;
  } else if (totalWeight <= 75000) {
      // Linear interpolation between 0.9 and 0.85
      multiplier = 1.15 - 0.04 * totalWeight / 10000;
  } else if (totalWeight <= 80000) {
      // Linear interpolation between 0.85 and 0.8
      multiplier = 1.6 - 0.1 * totalWeight / 10000;
  } else if (totalWeight <= 120000) {
      // Linear interpolation between 0.8 and 0.7
      multiplier = 1 - 0.025 * totalWeight / 10000;
  } else {
      multiplier = 0.7;
  }

  return hiddenBoostValue * multiplier;
}

function getQBReloadTime(baseReloadTime, idealWeight, weight) {
	const multiplier = piecewiseLinear(
		(weight - idealWeight) / 10000., 
		[[0, 1], [0.5, 1.1], [1, 1.3], [3, 3], [5, 3.5]]
	)
	return baseReloadTime * multiplier	
}

/**********************************************************************************/

const unitSlots = ['RightArm', 'LeftArm', 'RightShoulder', 'LeftShoulder']
const frameSlots = ['Head', 'Core', 'Arms', 'Legs']
const allSlots = unitSlots.concat(frameSlots, ['Booster', 'FCS', 'Generator'])

function computeAllStats(parts) {
	const totWeight = sumKeyOver(parts, 'Weight', allSlots)

	let baseSpeed, baseQBSpeed
	if(parts['Legs']['LegType'] === 'Tank')
		[baseSpeed, baseQBSpeed] = [
			parts['Legs']['TravelSpeed'],
			parts['Legs']['"HighSpeedPerf"']
		]
	else
		[baseSpeed, baseQBSpeed] = [
			parts['Booster']['Thrust'] * 6 / 100.,
			parts['Booster']['QBThrust'] / 50.
		]

	const res = {
		'AP': sumKeyOver(parts, 'AP', frameSlots),
		'Anti-Kinetic Defense': sumKeyOver(parts, 'AntiKineticDefense', frameSlots),
		'Anti-Energy Defense': sumKeyOver(parts, 'AntiEnergyDefense', frameSlots),
		'Anti-Explosive Defense': sumKeyOver(parts, 'AntiExplosiveDefense', frameSlots),
		'Attitude Stability': sumKeyOver(parts, 'AttitudeStability', ['Head', 'Core', 'Legs']),
		'Attitude Recovery': getAttitudeRecovery(totWeight),
		'Target Tracking': getTargetTracking(parts['Arms'].FirearmSpecialization),
		'Boost Speed': getBoostSpeed(baseSpeed, totWeight),
		'QB Speed': getQBSpeed(baseQBSpeed, totWeight),
		'QB EN Consumption': 0,
		'QB Reload Time': getQBReloadTime(
			parts['Booster']['QBReloadTime'],
			parts['Booster']['QBReloadIdealWeight'],
			totWeight
		),
		'EN Capacity': parts['Generator']['ENCapacity'],
		'EN Supply Efficiency': 0,
		'EN Recharge Delay': 0,
		'Total Weight': totWeight,
		'Total Arms Load': sumKeyOver(parts, 'Weight', ['RightArm', 'LeftArm']),
		'Arms Load Limit': parts['Arms']['ArmsLoadLimit'],
		'Total Load': sumKeyOver(parts, 'Weight', complement(allSlots, 'Legs')),
		'Load Limit': parts['Legs']['LoadLimit'],
		'Total EN Load': sumKeyOver(parts, 'ENLoad', complement(allSlots, 'Generator')),
		'EN Output': 0
		}
	return res
}

/**********************************************************************************/

const StatsDisplay = ({assemblyParts}) => {
	const stats = computeAllStats(assemblyParts)

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