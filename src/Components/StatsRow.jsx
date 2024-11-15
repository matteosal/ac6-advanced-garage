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
	'MeleeAtkENConsumption', 'Weight', 'ENLoad', 'CurrentLoad', 'CurrentArmsLoad', 
	'CurrentENLoad'];

// AC bar-only stats. For these lower is better but the stats should not be inverted
const avoidInvertingBar = ['CurrentLoad', 'CurrentArmsLoad', 'CurrentENLoad']

function isBetter(name, a, b) {
	if (lowerIsBetter.includes(name))
		return a < b
	else
		return a > b
}

const [blue, red] = ['rgb(62, 152, 254)', 'rgb(253, 52, 45)'];

function toScore(val, min, max) {
	return Math.max((val - min) / (max - min) * 100, 2);
}

const StatBar = ({kind, name, left, right, limit, color}) => {
	let min, max;
	if(kind !== undefined)
		[min, max] = glob.partStatsRanges[kind][name];
	else
		[min, max] = glob.acStatsRanges[name];

	if(isBetter(name, min, max) && !avoidInvertingBar.includes(name))
		[min, max] = [max, min]
	const limitPos = toScore(limit, min, max);
	const rightWidth = toScore(right, min, max);
	// leftWidth is the width of the div nested into the "right" width so we have
	// to account for that
	const leftWidth = Math.max(toScore(left, min, max) / rightWidth * 100, 2);	

	const shrink = '96%';

	return (
		<>
		{
			limit !== undefined ?
			<div style={{width: shrink, margin: '0px auto'}}>
				<div style={{lineHeight: '50%', marginLeft: '-3px', paddingLeft: limitPos + '%'}}>
					{downwardsTriangleChar}
				</div>
			</div> : 
			<></>
		}
		<div style={{borderLeft: 'solid 2px', borderRight: 'solid 2px'}}>
		<div style={{backgroundColor: 'black', width: shrink, margin: '0px auto'}}>
			<div style={{
				width: rightWidth + '%',
				height: '5px',
				backgroundColor: color,
				position: 'relative'
			}}>
				{
					left != null ?
					<div style={{
						width: leftWidth + '%',
						height: '9px',
						borderRight: 'solid 1px',
						backgroundColor: 'transparent',
						position: 'absolute',
						bottom: '-2px'
					}}>
					</div> : 
					<></>
				}
			</div>
		</div>
		</div>
		</>
	)
}

const multChar = '\u00d7'
const doubleArrowChar = '\u00bb';
const upwardsTriangleChar = '\u23f6';
const downwardsTriangleChar = '\u23f7';
const longDashCharacter = '\u2012';

function toValueAndDisplay(name, raw) {
	let value;
	let display;
	if(raw !== null && raw !== undefined && raw.constructor === Array) {
		value = raw[0] * raw[1];
		display = raw[0].toString() + multChar + raw[1].toString()
	} else {
		value = raw;
		const roundTarget = roundTargets[name];
		if(roundTarget !== undefined)
			display = glob.round(raw, roundTarget)
		else
			display = raw
	}
	return [value, display]
}

const StatsRow = ({isEmpty, name, leftRaw, rightRaw, kind, background, barOnly, barOnlyLimit}) => {

	if(isEmpty)
		return (
			<tr style={{background: background}}>
				<td colSpan={6}>&nbsp;</td>
			</tr>
		)

	let [left, leftDisplay] = toValueAndDisplay(name, leftRaw);
	let [right, rightDisplay] = toValueAndDisplay(name, rightRaw);

	let rightColor = 'white';
	let triangle = '';
	if(left !== null && left !== undefined) { // Comparison with left field present
		// Set colors and triangle if needed
		if(typeof left === 'number') {
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
	}

	const colW = {name: '64%', value: '12%', symbol: '5%'};
	// kind !== undefined indicates we are creating a row for the part stats panel
	if(kind !== undefined) {
		colW.name = '42%';
		colW.bar = '22%';
	}

	if(barOnly)
		return (
			<tr style={{background: background}}>
				<td style={{padding: '5px 0px 5px 25px', width: colW.name}}>
					{glob.toDisplayString(name)}
				</td>
				<td colSpan={3}>
					<StatBar 
						kind={kind}
						name={name}
						left={left}
						right={right}
						limit={barOnlyLimit}
						color={rightColor}
					/>
				</td>
				<td style={{width: colW.symbol}}></td>
			</tr>
	)

	return (
	<tr style={{background: background}}>
		<td style={{padding: '5px 0px 5px 25px', width: colW.name}}>
			{glob.toDisplayString(name)}
		</td>
		{
			kind != undefined ?
				<><td style={{width: colW.bar}}>
					<StatBar kind={kind} name={name} left={left} right={right} color={rightColor}/>
				</td></> :
				<></>
		}
		<td style={
			{color: 'gray', textAlign: 'right', width: colW.value, fontWeight: 'bold'}
		}>
			{leftDisplay}
		</td>
		<td style={{textAlign: 'center', color: 'gray', width: colW.symbol}}>
			{doubleArrowChar}
		</td>
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