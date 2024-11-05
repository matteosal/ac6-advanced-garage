import {globPartsData, globPartSlots} from '../Misc/Globals.js'

/**********************************************************************************/

function sumKeyOver(parts, key, pos) {
	return pos.map(p => parts[p]).reduce(
		(acc, current) => acc + current[key],
		0
	)
}

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
	const multiplier = piecewiseLinear(weight / 10000., 
		[[4, 1.5], [6, 1.2], [8, 0.9], [11, 0.6], [14, 0.57]]
	)
	return base * multiplier
}

const firearmSpecMapping = {26: 41, 45: 72, 53: 80, 80: 86, 88: 87, 92: 88, 95: 89, 96: 89, 
	100: 90, 102: 90, 103: 90, 104: 90, 122: 94, 123: 94, 128: 95, 133: 96, 136: 97, 160: 104}

function getTargetTracking(firearmSpec) {
	return firearmSpecMapping[firearmSpec]
}

function getQBReloadTime(baseReloadTime, idealWeight, weight) {
	const multiplier = piecewiseLinear((weight - idealWeight) / 10000., 
		[[0, 1], [0.5, 1.1], [1, 1.3], [3, 3], [5, 3.5]]
	)
	return baseReloadTime * multiplier	
}

/**********************************************************************************/

function computeAllStats(parts) {
	const totWeight = sumKeyOver(parts, 'Weight', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
	return (
		{
			'AP': sumKeyOver(parts, 'AP', [4, 5, 6, 7]),
			'Anti-Kinetic Defense': sumKeyOver(parts, 'AntiKineticDefense', [4, 5, 6, 7]),
			'Anti-Energy Defense': sumKeyOver(parts, 'AntiEnergyDefense', [4, 5, 6, 7]),
			'Anti-Explosive Defense': sumKeyOver(parts, 'AntiExplosiveDefense', [4, 5, 6, 7]),
			'Attitude Stability': sumKeyOver(parts, 'AttitudeStability', [4, 5, 7]),
			'Attitude Recovery': getAttitudeRecovery(totWeight),
			'Target Tracking': getTargetTracking(parts[6].FirearmSpecialization),
			'Boost Speed': 0,
			'QB Speed': 0,
			'QB EN Consumption': 0,
			'QB Reload Time': getQBReloadTime(parts[8].QBReloadTime, parts[8].QBReloadIdealWeight, totWeight),
			'EN Capacity': parts[10].ENCapacity,
			'EN Supply Efficiency': 0,
			'EN Recharge Delay': 0,
			'Total Weight': totWeight,
			'Total Arms Load': sumKeyOver(parts, 'Weight', [0, 1]),
			'Total Load': sumKeyOver(parts, 'Weight', [0, 1, 2, 3, 4, 5, 6, 8, 9, 10]),
			'Load Limit': parts[7].LoadLimit,
			'Total EN Load': sumKeyOver(parts, 'ENLoad', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
			'EN Output': 0
		}
	)
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