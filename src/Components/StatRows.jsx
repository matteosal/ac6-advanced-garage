import { useState } from 'react';

import { Tooltip } from 'react-tooltip'
import Collapsible from 'react-collapsible';

import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

import * as glob from '../Misc/Globals.js';

const PlotlyPlot = createPlotlyComponent(Plotly);


/***************************************************************************************/

const roundTargets = {'AttitudeRecovery': 1, 'BoostSpeed': 1, 'QBSpeed': 1, 
	'QBENConsumption': 1, 'EffectiveAPKinetic': 1, 'EffectiveAPEnergy': 1, 
	'EffectiveAPExplosive': 1, 'EffectiveAPAvg': 1, 'QBReloadTime': 0.01, 
	'ENSupplyEfficiency': 1, 'ENRechargeDelay': 0.01, 'QBENRechargeTime': 0.01, 
	'ENRechargeDelayRedline': 0.01, 'FullRechargeTime': 0.01, 'FullRechargeTimeRedline': 0.01,
	'RightArmMissileLockTime': 0.01, 'LeftArmMissileLockTime': 0.01, 
	'RightBackMissileLockTime': 0.01,'LeftBackMissileLockTime': 0.01
};

const lowerIsBetter = ['QBENConsumption', 'QBReloadTime', 'ENRechargeDelay', 'TotalWeight',
	'TotalArmsLoad', 'TotalLoad', 'TotalENLoad', 'ATKHeatBuildup', 'ChgHeatBuildup', 
	'Recoil', 'ChgENLoad', 'ChgAmmoConsumption', 'FullChgTime', 'FullChgAmmoConsump', 
	'FullChgHeatBuildup', 'ChargeTime', 'DplyHeatBuildup', 'HomingLockTime', 'ReloadTime', 
	'AmmunitionCost', 'ScanStandbyTime', 'QBReloadTime', 'ABENConsumption', 
	'MeleeAtkENConsumption', 'Weight', 'ENLoad', 'CurrentLoad', 'CurrentArmsLoad', 
	'CurrentENLoad', 'ENRechargeDelayRedline', 'QBENRechargeTime', 'FullRechargeTime',
	'FullRechargeTimeRedline', 'RightArmMissileLockTime', 'LeftArmMissileLockTime',
	'RightBackMissileLockTime', 'LeftBackMissileLockTime'];

function isBetter(name, a, b) {
	if (lowerIsBetter.includes(name))
		return a < b
	else
		return a > b
}

const [blue, red] = ['rgb(62, 152, 254)', 'rgb(253, 52, 45)'];

const Paragraphs = ({text}) => {
	const split = text.split('\n');
	return (
		split.map(
			(str, i) => 
				<>
					<p key={i}>{str}</p>
					{i === split.length - 1 ? <></> : <p key={i + 'newline'}>&nbsp;</p>}
				</>
		)
	);
}

let anchorId = 0;
function toAnchorName(str) {
	if(anchorId === 1000)
		anchorId = 0;
	return str.replace('/', '') + (anchorId++)
}

const InfoBox = ({name, tooltip}) => {
	const anchorName = toAnchorName(name);
	return(
		<>
		<div className={anchorName} style={{margin: '2px 1px 0px 2px'}}>
			<img src={glob.infoIcon} alt={'info icon'} width='100%'/>
		</div>
		<Tooltip 
			style={{maxWidth: '20%', textAlign: 'justify'}}
			anchorSelect={'.' + anchorName}
			place="left" 
		>
			<Paragraphs text={tooltip} />
		</Tooltip>
		</>
	)
}

/***************************************************************************************/

function toScore(val, min, max) {
	return Math.max((val - min) / (max - min) * 100, 2);
}

const barDivShrink = '96%';

// AC bar-only stats. For these lower is better but the stats should not be inverted
const avoidInvertingBar = ['CurrentLoad', 'CurrentArmsLoad', 'CurrentENLoad']

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

const namePadding = '4px 0px';

const NumericRow = ({name, leftRaw, rightRaw, kind, tooltip, buildCompareMode}) => {

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

	let infoW, nameW, barW, numW, symbolW;
	if(buildCompareMode) {
		[infoW, nameW, numW, symbolW] = ['15px', '65%', '20%', '5%']
	} else {
		// kind !== undefined indicates we are creating a row for the part stats panel and there
		// will be a bar as well, so nameW has to shrink and barW is used. If 
		//	buildCompareMode == true the kind is always undefined
		nameW = kind === undefined ? '63%' : '43%';
		[infoW, barW, numW, symbolW] = ['15px', '20%', '12%', '5%']
	}

	return (
		<>
		<div 
			style={{display: 'inline-block', width: infoW, verticalAlign: 'middle'}}
			className={name}
		>
			{tooltip !== undefined ? <InfoBox name={name} tooltip={tooltip} /> : <></>}
		</div>
		<div style={{display: 'inline-block', padding: namePadding, width: nameW}}>
			{glob.toDisplayString(name)}
		</div>
		{
			kind !== undefined ?
				<div style={{display: 'inline-block', width: barW}}>
					<StatBar kind={kind} name={name} left={left} right={right} color={rightColor}/>
				</div> :
				<></>
		}
		{
			buildCompareMode ?
			<></> :
			<div style={
				{display: 'inline-block', color: 'gray', textAlign: 'right', 
					width: numW, fontWeight: 'bold'}
			}>
				{leftDisplay}
			</div> 
		}
		<div style={{display: 'inline-block', textAlign: 'center', color: 'gray', 
			width: symbolW}
		}>
			{doubleArrowChar}
		</div>
		<div style={
			{display: 'inline-block', color: rightColor, textAlign: 'right', 
				width: numW, fontWeight: 'bold'}
		}>
			{rightDisplay}
		</div>
		<div style={{display: 'inline-block', color: rightColor, textAlign: 'center', 
			width: symbolW}
		}>
			{triangle}
		</div>
	</>
	);
}

/***************************************************************************************/

const BarOnlyRow = ({name, left, right, limit, tooltip}) => {

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
			<div 
				style={{display: 'inline-block', width: '3%', verticalAlign: 'middle'}}
				className={name}
			>
				{tooltip !== undefined ? <InfoBox name={name} tooltip={tooltip} /> : <></>}
			</div>			
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

/***************************************************************************************/

function proportionStyle(val, color) {
	return(
		{display: 'inline-block', verticalAlign: 'middle', width: val + '%', height: '20px',
			textAlign: 'center', fontSize: '70%', background: color}
	)
}

const cyan = 'rgb(72, 202, 228)';

const ProportionBar = ({values, buildCompareMode}) => {
	const [round0, round1] = [glob.round(values[0]), glob.round(values[1])];
	const round = [round0, round1, 100 - round0 - round1];
	const displayLimit = buildCompareMode ? 28 : 18;
	const displayed = round.map(val => val > displayLimit ? val + '%' : null)
	return(
		<div style={{borderLeft: 'solid 2px', borderRight: 'solid 2px', lineHeight: '20px'}}>
			<div style={{width: barDivShrink, margin: '0px auto'}}>
				<div style={proportionStyle(values[0], cyan)}>
					{displayed[0]}
				</div>
				<div style={proportionStyle(values[1], 'rgb(0, 150, 199)')}>
					{displayed[1]}
				</div>
				<div style={proportionStyle(values[2], 'rgb(7, 245, 209)')}>
					{displayed[2]}
				</div>
			</div>
		</div>
	)
}

const ProportionBarRow = ({name, left, right, tooltip, buildCompareMode}) => {
	const nameW = buildCompareMode ? '60%' : '30%';
	const leftBarW = buildCompareMode ? '0' : '30%';
	return (
		<>
			<div 
				style={{display: 'inline-block', width: '15px', verticalAlign: 'middle'}}
				className={name}
			>
				{tooltip !== undefined ? <InfoBox name={name} tooltip={tooltip} /> : <></>}
			</div>			
			<div style={{display: 'inline-block', padding: namePadding, 
				width: nameW}
			}>
				{glob.toDisplayString(name)}
			</div>
			<div style={{display: 'inline-block', width: leftBarW, padding: '0px 2% 0px 3%'}}>
				{
					left === null || buildCompareMode ? 
						<></> :
						<ProportionBar values={left}/>
				}
			</div>
			<div style={{display: 'inline-block', width: '30%'}}>
				<ProportionBar values={right} buildCompareMode={buildCompareMode}/>
			</div>
		</>
	)
}

/***************************************************************************************/

const RangePlot = ({left, right}) => {
	// left/right data is 
	// [rArmRange, lArmRange, rBackRange, lBackRange, closeAssist, mediumAssist, longAssist]
	const cappedRanges = right.slice(0, 4).map(r => r === null ? r : Math.min(r, 300));

	let data = [
		{
			x: [0, 130, 130, 260, 260, 320],
			y: [right[4], right[4], right[5], right[5], right[6], right[6]],
			mode: 'lines',
			line: {color: cyan}
		}
	];
	data = data.concat(
		cappedRanges.map(r => {
			return {x: [r, r], y: [0, 300], mode: 'lines', line: {color: red}}
		})
	);

	if(left !== null)
		data.push(
			{
			x: [0, 130, 130, 260, 260, 320],
			y: [left[4], left[4], left[5], left[5], left[6], left[6]],
				mode: 'lines',
				line: {dash: 'dash', color: cyan}
			}
		)

	const font = {family: 'Aldrich-Custom, sans-serif'};

	return (
		<PlotlyPlot
			style={{width: '100%', height: '100%'}}
			data={data}
			layout={{
				margin: {l: 30, r: 25, t: 25, b: 45},
				xaxis: {
					range: [0, 320],
					title: {text: 'Distance', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				yaxis: {
					range: [0, 95],
					title: {text: 'Assist', font: font, standoff: 1},
					color: 'white',
					showticklabels: false
				},
				showlegend: false,
				plot_bgcolor: 'rgb(255, 255, 255, 0.1)',
				paper_bgcolor: 'rgb(255, 255, 255, 0.1)'
			}}
			config={{displayModeBar: false, staticPlot: true}}
		/>
	)
}

const RangePlotRow = ({name, left, right, tooltip}) => {
	return(
		<>
			<div 
				style={{display: 'inline-block', width: '15px', verticalAlign: 'middle'}}
				className={name}
			>
				{tooltip !== undefined ? <InfoBox name={name} tooltip={tooltip} /> : <></>}
			</div>		
			<div style={{display: 'inline-block', padding: namePadding}
			}>
				{glob.toDisplayString(name)}
			</div>
			<div style={{width: '305px', height: '200px', margin: '0px auto'}}>
				<RangePlot left={left} right={right} />
			</div>
		</>
	)
}

/***************************************************************************************/

function getLinePoints(delay, gap, rate, enMax) {
	const tMax = delay + (enMax - gap) / rate;
	return (
		{t: [delay, delay, tMax], en: [0, gap, enMax]}
	)
}

function getPlotPoints(set) {
	if(set === null)
		return null;
	return (
		{
			normal: getLinePoints(...set.normal),
			redline: getLinePoints(...set.redline)
		}
	)
}

function pushPoint(points, t, en) {
	points.normal.t.push(t);
	points.normal.en.push(en);
	points.redline.t.push(t);
	points.redline.en.push(en);	
}

const maxENCapacity = glob.partsData.filter(part => part['Kind'] === 'Generator').reduce(
	(max, part) => {
		return Math.max(max, part['ENCapacity'])
	},
	0
)

const EnergyPlot = ({left, right}) => {
	let rightPoints = getPlotPoints(right);
	let leftPoints = getPlotPoints(left);

	let tMax = Math.max(rightPoints.normal.t[2], rightPoints.redline.t[2]);
	if(leftPoints !== null)
		tMax = Math.max(tMax, leftPoints.normal.t[2], leftPoints.redline.t[2]);

	const [plotW, plotH] = [Math.max(6, 1.1 * tMax), 1.1 * maxENCapacity];
	pushPoint(rightPoints, plotW, rightPoints.normal.en[2]);
	if(leftPoints !== null)
		pushPoint(leftPoints, plotW, leftPoints.normal.en[2]);

	let data = [
		{
			x: rightPoints.normal.t,
			y: rightPoints.normal.en,
			mode: 'lines',
			line: {color: cyan},
		},
		{
			x: rightPoints.redline.t,
			y: rightPoints.redline.en,
			mode: 'lines',
			line: {color: red},
		}
	];

	if(leftPoints !== null) {
		data.push(
			{
				x: leftPoints.normal.t,
				y: leftPoints.normal.en,
				mode: 'lines',
				line: {dash: 'dash', color: cyan}
			}
		);
		data.push(
			{
				x: leftPoints.redline.t,
				y: leftPoints.redline.en,
				mode: 'lines',
				line: {dash: 'dash', color: red}
			}
		);
	}

	const font = {family: 'Aldrich-Custom, sans-serif'};

	return (
		<PlotlyPlot
			style={{width: '100%', height: '100%'}}
			data={data}
			layout={{
				margin: {l: 30, r: 25, t: 25, b: 45},
				xaxis: {
					range: [0, plotW],
					title: {text: 'Time', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				yaxis: {
					range: [0, plotH],
					title: {text: 'EN', font: font, standoff: 1},
					color: 'white',
					showticklabels: false
				},
				showlegend: false,
				plot_bgcolor: 'rgb(255, 255, 255, 0.1)',
				paper_bgcolor: 'rgb(255, 255, 255, 0.1)'
			}}
			config={{displayModeBar: false, staticPlot: true}}
		/>
	)
}

const EnergyPlotRow = ({name, left, right, tooltip}) => {
	return(
		<>
			<div 
				style={{display: 'inline-block', width: '15px', verticalAlign: 'middle'}}
				className={name}
			>
				{tooltip !== undefined ? <InfoBox name={name} tooltip={tooltip} /> : <></>}
			</div>		
			<div style={{display: 'inline-block', padding: namePadding}
			}>
				{glob.toDisplayString(name)}
			</div>
			<div style={{width: '305px', height: '200px', margin: '0px auto'}}>
				<EnergyPlot left={left} right={right} />
			</div>
		</>
	)
}

/**********************************************************************************/

const NoComparisonNumericRow = ({name, left, right, tooltip}) => {
	if(left === undefined)
		left = longDashCharacter
	return (
		<>
		<div 
			style={{display: 'inline-block', width: '3%', verticalAlign: 'middle'}}
			className={name}
		>
			{tooltip !== undefined ? <InfoBox name={name} tooltip={tooltip} /> : <></>}
		</div>
		<div style={{display: 'inline-block', padding: namePadding, width: '63%'}}>
			{glob.toDisplayString(name)}
		</div>
		<div style={
			{display: 'inline-block', color: 'gray', textAlign: 'right', 
				width: '12%', fontWeight: 'bold'}
		}>
			{left}
		</div>
		<div style={{display: 'inline-block', textAlign: 'center', color: 'gray', 
			width: '5%'}
		}>
			{doubleArrowChar}
		</div>
		<div style={
			{display: 'inline-block', color: 'white', textAlign: 'right', 
				width: '12%', fontWeight: 'bold'}
		}>
			{right}
		</div>
	</>
	);
}

/**********************************************************************************/

const fireAnimationNote = '\nNOTE: all DPS/IPS related specs assume that the fire animation ' +
	'time is zero, so they are an overestimate when that is not the case (e.g. missile ' +
	'launchers that fire individual missiles in rapid sequence).'

const aimAssistProfileDesc = 'Gives an indication of how well the FCS is paired with the ' +
	'unit ranges. Shows the FCS aim assist at close/medium/long range (horizontal cyan ' +
	'lines) and unit ideal ranges (vertical red lines), arbitrarily capped at 300m.';

const enRecoveryProfilesDesc = 'Shows the energy recovered over time in the normal (cyan) ' +
	'and redlining (red) cases.';

const enRecoveryProfilesNote = 'NOTE: the cyan profile is a limit case because if the ' +
	'generator is not fully depleted energy recovery will not start from zero energy.';

const statTooltips = {
	'EffectiveAPKinetic': 'Amount of raw kinetic damage that can be sustained.',
	'EffectiveAPEnergy': 'Amount of raw energy damage that can be sustained.',
	'EffectiveAPExplosive': 'Amount of raw explosive damage that can be sustained.',
	'EffectiveAPAvg': 'Average of all effective AP values.',
	'RightArmMissileLockTime': 'Missile lock time of right arm unit, modified by FCS.',
	'LeftArmMissileLockTime': 'Missile lock time of left arm unit, modified by FCS.',
	'RightBackMissileLockTime': 'Missile lock time of right back unit, modified by FCS.',
	'LeftBackMissileLockTime': 'Missile lock time of left back unit, modified by FCS.',
	'AimAssistProfile': aimAssistProfileDesc + ' When a new FCS is in preview, the current ' +
		'FCS assist values are shown with dashed lines and the new with solid ones. When a ' +
		'unit is in preview only the new unit ranges are shown.',
	'MaxConsecutiveQB': 'Maximum number of consecutive quick boosts before running out of ' +
		'energy (assuming no energy is recovered in between quick boosts).',
	'ENRechargeDelayRedline': 'Time before energy starts recovering when the generator is ' +
		'fully depleted.',
	'QBENRechargeTime': 'Time to recovery energy consumed by one quick boost when the ' +
		'generator is not fully depleted.\nNOTE: despite the energy bar depleting immediately ' +
		'when a quick boost is performed, the energy is actually gradually depleted ' +
		'throughout entire quick boost animation. This means that the value of the QB Jet ' +
		'Duration stat is added to the recovery time to compute this value.',
	'FullRechargeTime': 'Time to recover an amount of energy equal to the energy capacity ' +
		'when the generator is not fully depleted.\nNOTE: this is a limit value because if ' +
		'the generator is not fully depleted energy recovery will recover less than the full ' +
		'energy capacity.',
	'FullRechargeTimeRedline': 'Time to fully recover energy when the generator is fully ' +
		'depleted',
	'ENRecoveryProfiles': enRecoveryProfilesDesc + ' When a new part is in preview, the ' +
		'current profiles are shown with dashed lines and the new ones with solid ones.\n' + 
		enRecoveryProfilesNote,
	'WeightByGroup': 'Shows the contributions of units (left), frame (middle) and inner ' +
		'parts (right) to the total weight.',
	'ENLoadByGroup': 'Shows the contributions of units (left), frame (middle) and inner ' +
		'parts (right) to the total energy load.',
	'Damage/s': 'Raw damage dealt per second, not counting reloads and cooldowns.' + 
		fireAnimationNote,
	'Impact/s': 'Raw impact damage dealt per second, not counting reloads and cooldowns.' + 
		fireAnimationNote,
	'AccumulativeImpact/s': 'Raw accumulated impact damage dealt per second, not counting ' + 
		'reloads and cooldowns.' + fireAnimationNote,
	'Damage/sInclReload': 'Damage per second factoring in the reload time and base homing ' +
		'lock time when present.' + fireAnimationNote,
	'Impact/sInclReload': 'Impact per second factoring in the reload time and base homing ' +
		'lock time when present.' + fireAnimationNote,
	'AccImpact/sInclReload': 'Accumulative impact per second factoring in the reload time and '
		+ 'base homing lock time when present.' + fireAnimationNote,
	'ComboDamage': 'Damage of full melee combo',
	'ComboImpact': 'Impact of full melee combo',
	'ComboAccumulativeImpact': 'Accumulative impact of full melee combo',
	'DirectAttackPower': 'Attack power on staggered opponents.',
	'DirectDamage/s': 'Damage per second on staggered opponents.' + fireAnimationNote,
	'ComboDirectDamage': 'Damage of full melee combo on staggered opponents.',
	'MagDumpTime': 'Minimum time to empty one magazine.'
};

const statTooltipsComparerMode = {
	'AimAssistProfile': aimAssistProfileDesc + ' When two builds are compared, this build\'s ' +
		'FCS assist values are shown with solid lines and the ones from the other build with ' +
		'dashed lines.',
	'ENRecoveryProfiles': enRecoveryProfilesDesc + ' When two builds are compared, this ' +
		'build\'s profiles are shown with solid lines and the ones from the other build with ' +
		'dashed lines.\n' + enRecoveryProfilesNote
}

function getTooltip(name, buildCompareMode) {
	if(!buildCompareMode)
		return statTooltips[name];
	const comparerModeTooltip = statTooltipsComparerMode[name];
	return comparerModeTooltip ? comparerModeTooltip : statTooltips[name]
}

const EmptyRow = () => <div style={{padding: namePadding}}>&nbsp;</div>

export const StatRow = ({leftStat, rightStat, pos, kind, buildCompareMode}) => {

	const tooltip = getTooltip(rightStat.name, buildCompareMode);

	if(rightStat.type === 'EmptyLine')
		return <EmptyRow key = {pos} />
	else if(rightStat.type === 'BarOnly')
		return (
			<BarOnlyRow
				name = {rightStat.name}
				left = {leftStat.value}
				right = {rightStat.value}
				limit = {rightStat.limit}
				key = {pos}				
			/>
		)
	else if(rightStat.type === 'ProportionBar')
		return(
			<ProportionBarRow
				name = {rightStat.name}
				left = {leftStat.value}
				right = {rightStat.value}
				tooltip = {tooltip}
				buildCompareMode = {buildCompareMode}
				key = {pos}				
			/>		
		)
	else if(rightStat.type === 'EnergyPlot') {
		return(
			<EnergyPlotRow
				name={rightStat.name}
				left={leftStat.value}	
				right={rightStat.value}
				tooltip={tooltip}
				key = {pos}
			/>		
		)		
	}
	else if(rightStat.type === 'RangePlot') {
		return(
			<RangePlotRow
				name={rightStat.name}
				left={leftStat.value}	
				right={rightStat.value}
				tooltip={tooltip}
				key = {pos}
			/>		
		)		
	}
	else if(rightStat.type === 'NumericNoComparison') {
		return(
			<NoComparisonNumericRow
				name={rightStat.name}
				left={leftStat.value}	
				right={rightStat.value}
				tooltip={tooltip}
				key = {pos}
			/>		
		)		
	}
	else return (
			<NumericRow
				name = {rightStat.name}
				leftRaw = {leftStat.value}
				rightRaw = {rightStat.value}
				kind = {kind}
				tooltip = {tooltip}
				buildCompareMode={buildCompareMode}
				key = {pos}
			/>
		)
}

const redRowBackground = 'rgb(255, 0, 0, 0.5)';
const redRowBackgroundHighlight = 'rgb(255, 0, 0, 0.75)';

const CollapsibleHeader = ({label, isOpen, isOverload}) => {
	const [highlighted, setHighlighted] = useState(false);

	const [imgTransform, imgPad] = isOpen ? ['none', '0px 8px 0px 10px'] : 
		['rotate(180deg)', '0px 10px 0px 8px'];
	const imgStyle = {filter: 'invert(1)', transform: imgTransform, padding: imgPad};

	let background;
	if(isOverload && highlighted)
		background = redRowBackgroundHighlight;
	else if(isOverload && !highlighted)
		background = redRowBackground;
	else if(!isOverload && highlighted)
		background = glob.paletteColor(5, 0.8);
	else
		background = glob.paletteColor(5, 0.3);

	return(
		<>
		<div 
			style={{background: background, 
				border: glob.paletteColor(5, 1, 1) + 'solid 1px', 
				padding: '8px 0', width: '99%', margin: '5px 0px 5px 0px', cursor: 'pointer'}}
			onMouseEnter={() => setHighlighted(true)}
			onMouseLeave={() => setHighlighted(false)}
		>
			<img src={glob.expandIcon} alt={'expand/collapse'} style={imgStyle} width='12px' />
			<div style={{display: 'inline-block'}}>
				{label}
			</div>
		</div>
		</>
	)
}

export const StatRowGroup = ({header, leftGroup, rightGroup, overloadTable, buildCompareMode}) => {
	const statRange = [...Array(rightGroup.length).keys()];
	let isOverload = false;
	if(overloadTable && Object.values(overloadTable).includes(true)) {
		isOverload = true;
	}
	return(
		<>
		<Collapsible 
			trigger={<CollapsibleHeader label={header} isOpen={false} isOverload={isOverload} />}
			triggerWhenOpen={<CollapsibleHeader label={header} isOpen={true} 
				isOverload={isOverload} />}
			open={true}
			transitionTime={1}
			key={header}
		>
		{
			statRange.map(
				innerPos => {
					const background = overloadTable && overloadTable[rightGroup[innerPos].name] ? 
						redRowBackground : 
						glob.tableRowBackground(innerPos);
					return(
						<div style={{background: background}} key={innerPos}>
							<StatRow
								leftStat={leftGroup[innerPos]}
								rightStat={rightGroup[innerPos]} 
								pos={innerPos}
								buildCompareMode={buildCompareMode}
								/>
						</div>
					)
				}
			)
		}
		</Collapsible>
		</>
	)
}
