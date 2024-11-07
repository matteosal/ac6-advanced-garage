import {round, toDisplayString} from '../Misc/Globals.js';

const roundTargets = {'AttitudeRecovery': 1, 'BoostSpeed': 1, 'QBSpeed': 1, 
	'QBENConsumption': 1, 'QBReloadTime': 0.01, 'ENSupplyEfficiency': 1, 
	'ENRechargeDelay': 0.01};

const lowerIsBetter = ['QBENConsumption', 'QBReloadTime', 'ENRechargeDelay', 'TotalWeight',
	'TotalArmsLoad', 'TotalLoad', 'TotalENLoad', 'ATKHeatBuildup', 'FullChgHeatBuildup', 
	'Recoil', 'ChgENLoad', 'FullChgTime', 'FullChgAmmoConsump', 'HomingLockTime', 'ReloadTime', 
	'AmmunitionCost', 'ScanStandbyTime', 'QBReloadTime', 'ABENConsumption', 
	'MeleeAtkENConsumption', 'Weight', 'ENLoad'];

function isBetter(name, a, b) {
	if (lowerIsBetter.includes(name))
		return a < b
	else
		return a > b
}

const doubleArrowChar = '\u00bb';
const upwardsTriangleChar = '\u23f6';
const downwardsTriangleChar = '\u23f7';
const longDashCharacter = '\u2012';

const StatsRow = ({name, left, right}) => {

	const roundTarget = roundTargets[name];

	let [leftDisplay, rightDisplay] = [left, right];
	let [leftStyle, rightStyle] = [{}, {}];
	let triangle = '';
	if(left !== null && left !== undefined) { // Comparison with left field present
		// Round if needed
		if(roundTarget !== undefined) {
			leftDisplay = round(leftDisplay, roundTarget);
			rightDisplay = round(rightDisplay, roundTarget);
		}
		// Set colors and triangle if needed
		if(typeof left === 'number') {
			const [blueStyle, redStyle] = [{'color': 'blue'}, {'color': 'red'}];
			if(isBetter(name, left, right)) {
				triangle = downwardsTriangleChar;
				[leftStyle, rightStyle] = [blueStyle, redStyle];
			}
			else if(isBetter(name, right, left)) {
				triangle = upwardsTriangleChar;
				[leftStyle, rightStyle] = [redStyle, blueStyle];
			}
		}
	} else if(left !== null && left === undefined) { // Comparison with missing left field
		// Round if needed
		if(roundTarget !== undefined) {
			rightDisplay = round(rightDisplay, roundTarget);
		}		
		leftDisplay = longDashCharacter;
	} else { // Not a comparison
		// Round if needed
		if(roundTarget !== undefined) {
			rightDisplay = round(rightDisplay, roundTarget);
		}		
		leftDisplay = '';
	}

	// For some reason the triangle makes the line taller
	let triangleStyle = {...rightStyle};
	triangleStyle['lineHeight'] = '1';

	return (
	<tr>
		<td>{toDisplayString(name)}</td>
		<td style={leftStyle}>{leftDisplay}</td>
		<td>{doubleArrowChar}</td>
		<td style={rightStyle}>{rightDisplay}</td>
		<td style={triangleStyle}>{triangle}</td>
	</tr>
	);
}

export default StatsRow;