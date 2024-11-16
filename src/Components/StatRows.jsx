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

const barDivShrink = '96%';

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

	return (
		<>
		{
			limit !== undefined ?
			<div style={{width: barDivShrink, margin: '0px auto'}}>
				<div style={{lineHeight: '50%', marginLeft: '-3px', paddingLeft: limitPos + '%'}}>
					{downwardsTriangleChar}
				</div>
			</div> : 
			<></>
		}
		<div style={{borderLeft: 'solid 2px', borderRight: 'solid 2px'}}>
		<div style={{backgroundColor: 'black', width: barDivShrink, margin: '0px auto'}}>
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

function proportionStyle(val, color) {
	return(
		{display: 'inline-block', verticalAlign: 'middle', width: val + '%', height: '20px',
			textAlign: 'center', fontSize: '70%', background: color}
	)
}

const ProportionBar = ({values}) => {
	const [round0, round1] = [glob.round(values[0]), glob.round(values[1])];
	const round = [round0, round1, 100 - round0 - round1];
	const displayed = round.map(val => val > 15 ? val + '%' : null)
	return(
		<div style={{borderLeft: 'solid 2px', borderRight: 'solid 2px', lineHeight: '20px'}}>
			<div style={{width: barDivShrink, margin: '0px auto'}}>
				<div style={proportionStyle(values[0], 'rgb(72, 202, 228)')}>
					{displayed[0]}
				</div>
				<div style={proportionStyle(values[1], 'rgb(0, 150, 199)')}>
					{displayed[1]}
				</div>
				<div style={proportionStyle(values[2], 'rgb(20, 156, 255)')}>
					{displayed[2]}
				</div>
			</div>
		</div>
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

const namePadding = '5px 0px 5px 3%';

const NumericRow = ({name, leftRaw, rightRaw, kind}) => {

	// This row is also used for unit stats such as attack power that can have
	// form e.g. 100x3 ([100, 3] in data) so we have to account for that
	let [left, leftDisplay] = toValueAndDisplay(name, leftRaw);
	let [right, rightDisplay] = toValueAndDisplay(name, rightRaw);

	let rightColor = 'white';
	let triangle = '';
	if(left !== null && left !== undefined) { // Comparison with left field present
	// Set colors and triangle if needed
		if(isBetter(name, left, right)) {
			triangle = downwardsTriangleChar;
			rightColor = red;
		}
		else if(isBetter(name, right, left)) {
			triangle = upwardsTriangleChar;
			rightColor = blue;
		}
	} else if(left !== null && left === undefined) { // Comparison with missing left field
		leftDisplay = longDashCharacter;
	}

	// kind !== undefined indicates we are creating a row for the part stats panel and there
	// will be a bar as well, so nameW has to shrink. barW is only used in this case
	const nameW = kind === undefined ? '63%' : '43%';
	const barW = '20%';

	return (
		<>
		<div style={{display: 'inline-block', padding: namePadding, width: nameW}}>
			{glob.toDisplayString(name)}
		</div>
		{
			kind != undefined ?
				<div style={{display: 'inline-block', width: barW}}>
					<StatBar kind={kind} name={name} left={left} right={right} color={rightColor}/>
				</div> :
				<></>
		}
		<div style={
			{display: 'inline-block', color: 'gray', textAlign: 'right', 
				width: '12%', fontWeight: 'bold'}
		}>
			{leftDisplay}
		</div>
		<div style={{display: 'inline-block', textAlign: 'center', color: 'gray', 
			width: '5%'}
		}>
			{doubleArrowChar}
		</div>
		<div style={
			{display: 'inline-block', color: rightColor, textAlign: 'right', 
				width: '12%', fontWeight: 'bold'}
		}>
			{rightDisplay}
		</div>
		<div style={{display: 'inline-block', color: rightColor, textAlign: 'center', 
			width: '5%'}
		}>
			{triangle}
		</div>
	</>
	);
}

const BarOnlyRow = ({name, left, right, limit}) => {

	let barColor = 'white';
	if(left !== null) { // Comparison
		if(isBetter(name, left, right)) {
			barColor = red;
		}
		else if(isBetter(name, right, left)) {
			barColor = blue;
		}
	}

	return (
		<>
			<div style={{display: 'inline-block', padding: namePadding, 
				width: '65%'}}>
				{glob.toDisplayString(name)}
			</div>
			<div style={{display: 'inline-block', width: '30%'}}>
				<StatBar 
					name={name}
					left={left}
					right={right}
					limit={limit}
					color={barColor}
				/>
			</div>
		</>
	)
}

const ProportionBarRow = ({name, left, right}) => {
	return (
		<>
			<div style={{display: 'inline-block', padding: namePadding, 
				width: '30%'}
			}>
				{glob.toDisplayString(name)}
			</div>
			<div style={{display: 'inline-block', width: '30%', padding: '0px 2% 0px 3%'}}>
				{
					left === null ? 
						<></> :
						<ProportionBar values={left}/>
				}
			</div>
			<div style={{display: 'inline-block', width: '30%'}}>
				<ProportionBar 
					values={right}
				/>
			</div>
		</>
	)
}

export {NumericRow, BarOnlyRow, ProportionBarRow};