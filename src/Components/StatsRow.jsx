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
	const score = Math.max((val - min) / (max - min) * 100, 1);

	return (
		<div style={{backgroundColor: 'black'}}>
			<div style={{width: score + '%', height: '5px', backgroundColor: 'white'}}></div>
		</div>
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
	if(roundTarget !== undefined) {
		leftDisplay = glob.round(leftDisplay, roundTarget);
		rightDisplay = glob.round(rightDisplay, roundTarget);
	}
	let rightColor = ['inherit', 'inherit'];
	let triangle = '';
	if(left !== null && left !== undefined) { // Comparison with left field present
		// Set colors and triangle if needed
		if(typeof left === 'number') {
			const [blue, red] = ['rgb(62, 152, 254)', 'rgb(253, 52, 45)'];
			if(isBetter(name, left, right)) {
				triangle = downwardsTriangleChar;
				rightColor = red;
			}
			else if(isBetter(name, right, left)) {
				triangle = upwardsTriangleChar;
				rightColor = blue;
			}
		}
	} else if(left !== null && left === undefined) { // Comparison with missing left field
		leftDisplay = longDashCharacter;
	} else { // Not a comparison	
		leftDisplay = '';
	}

	const colW = {name: '64%', value: '12%', symbol: '5%'};
	if(kind !== null) {
		colW.name = '42%';
		colW.bar = '22%';
	}

	return (
	<tr style={{background: background}}>
		<td style={{padding: '5px 0px 5px 25px', width: colW.name}}>
			{glob.toDisplayString(name)}
		</td>
		{
			kind != null ?
				<><td style={{width: colW.bar}}>
					<StatBar kind={kind} name={name} val={rightDisplay}/>
				</td></> :
				<></>
		}
		<td style={
			{color: 'gray', textAlign: 'right', width: colW.value, fontWeight: 'bold'}
		}>
			{leftDisplay}
		</td>
		<td style={{textAlign: 'center', color: 'gray', width: colW.symbol}}>{doubleArrowChar}</td>
		<td style={
			{color: rightColor, textAlign: 'right', width: colW.value, fontWeight: 'bold'}
		}>
			{rightDisplay}
		</td>
		<td style={{color: rightColor, textAlign: 'center', width: colW.symbol}}>{triangle}</td>
	</tr>
	);
}

export default StatsRow;