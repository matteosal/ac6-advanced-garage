import * as glob from '../Misc/Globals.js';

const roundTargets = {'AttitudeRecovery': 1, 'BoostSpeed': 1, 'QBSpeed': 1, 
	'QBENConsumption': 1, 'EffectiveAPKinetic': 1, 'EffectiveAPEnergy': 1, 
	'EffectiveAPExplosive': 1, 'EffectiveAPAvg': 1, 'QBReloadTime': 0.01, 
	'ENSupplyEfficiency': 1, 'ENRechargeDelay': 0.01, 'QBENRechargeTime': 0.01, 
	'ENRechargeDelayRedline': 0.01, 'FullRechargeTime': 0.01, 'FullRechargeTimeRedline': 0.01};

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

const StatBar = ({kind, name, val}) => {
	const [min, max] = glob.partStatsRanges[kind][name];
	const score = (val - min) / (max - min) * 100;

	return (
		<td>
			<div style={{width: '150px', backgroundColor: 'black'}}>
				<div style={{width: score + '%', height: '5px', backgroundColor: 'white'}}>{''}</div>
			</div>
		</td>
	)
}

const doubleArrowChar = '\u00bb';
const upwardsTriangleChar = '\u23f6';
const downwardsTriangleChar = '\u23f7';
const longDashCharacter = '\u2012';

const StatsRow = ({isEmpty, name, left, right, kind, background}) => {

	if(isEmpty)
		return (
			<tr style={{background: background}}>
				<td colSpan={6}>&nbsp;</td>
			</tr>
		)

	const roundTarget = roundTargets[name];

	let [leftDisplay, rightDisplay] = [left, right];
	let [leftStyle, rightStyle] = [{}, {}];
	let triangle = '';
	if(left !== null && left !== undefined) { // Comparison with left field present
		// Round if needed
		if(roundTarget !== undefined) {
			leftDisplay = glob.round(leftDisplay, roundTarget);
			rightDisplay = glob.round(rightDisplay, roundTarget);
		}
		// Set colors and triangle if needed
		if(typeof left === 'number') {
			const [blueStyle, redStyle] = [{'color': '#00ffff'}, {'color': 'red'}];
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
			rightDisplay = glob.round(rightDisplay, roundTarget);
		}		
		leftDisplay = longDashCharacter;
	} else { // Not a comparison
		// Round if needed
		if(roundTarget !== undefined) {
			rightDisplay = glob.round(rightDisplay, roundTarget);
		}		
		leftDisplay = '';
	}

	// For some reason the triangle makes the line taller
	let triangleStyle = {...rightStyle, ...{lineHeight: '1', width: '10px'}};

	const colW = ['70%', '10%', '5%', '10%', '5%'];

	return (
	<tr style={{background: background}}>
		<td style={{padding: '5px 0px 5px 25px', width: colW[0]}}>
			{glob.toDisplayString(name)}
		</td>
		{
			kind != null ?
				<StatBar kind={kind} name={name} val={rightDisplay}/> :
				<></>
		}
		<td style={{...leftStyle, width: colW[1]}}>{leftDisplay}</td>
		<td style={{width: colW[2]}}>{doubleArrowChar}</td>
		<td style={{...rightStyle, width: colW[3]}}>{rightDisplay}</td>
		<td style={{...triangleStyle, width: colW[4]}}>{triangle}</td>
	</tr>
	);
}

export default StatsRow;