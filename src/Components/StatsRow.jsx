import {round, toDisplayString} from '../Misc/Globals.js'

const roundTargets = {'AttitudeRecovery': 1, 'BoostSpeed': 1, 'QBSpeed': 1, 
	'QBENConsumption': 1, 'QBReloadTime': 0.01, 'ENSupplyEfficiency': 1, 'ENRechargeDelay': 0.01}

const lowerIsBetter = ['QBENConsumption', 'QBReloadTime', 'ENRechargeDelay', 'TotalWeight',
	'TotalArmsLoad', 'TotalLoad', 'TotalENLoad', 'ATKHeatBuildup', 'FullChgHeatBuildup', 
	'Recoil', 'ChgENLoad', 'FullChgTime', 'FullChgAmmoConsump', 'HomingLockTime', 'ReloadTime', 
	'AmmunitionCost', 'ScanStandbyTime', 'QBReloadTime', 'ABENConsumption', 
	'MeleeAtkENConsumption', 'Weight', 'ENLoad']

function isBetter(name, a, b) {
	if (lowerIsBetter.includes(name))
		return a < b
	else
		return a > b
}

const StatsRow = ({name, left, right}) => {
	const hasLeft = left != null
	const roundTarget = roundTargets[name]

	var [leftDisplay, rightDisplay] = [left, right]
	if(roundTarget != undefined) {
		var rightDisplay = round(rightDisplay, roundTarget)
		if(hasLeft)
			leftDisplay = round(leftDisplay, roundTarget)
	}

	if(hasLeft && typeof left === 'number') {
		const [blueStyle, redStyle] = [{'color': 'blue'}, {'color': 'red'}]
		if(left === right)
			var [leftStyle, rightStyle] = [{}, {}]
		else if(isBetter(name, left, right)) 
			var [leftStyle, rightStyle] = [blueStyle, redStyle]
		else
			var [leftStyle, rightStyle] = [redStyle, blueStyle]
			
	} else {
		var [leftStyle, rightStyle] = [{}, {}]
	}

	return (
	<tr>
		<td>{toDisplayString(name)}</td>
		<td style={leftStyle}>{leftDisplay}</td>
		<td>»</td>
		<td style={rightStyle}>{rightDisplay}</td>
	</tr>
	)
}

export default StatsRow