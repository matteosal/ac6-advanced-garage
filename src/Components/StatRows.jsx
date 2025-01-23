import { useState, useContext } from 'react';

import Collapsible from 'react-collapsible';

import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

import * as glob from '../Misc/Globals.js';
import {BuilderStateContext} from "../Contexts/BuilderStateContext.jsx";
import InfoBox from './InfoBox.jsx';

const PlotlyPlot = createPlotlyComponent(Plotly);


/***************************************************************************************/

const lowerIsBetter = ['QBENConsumption', 'QBReloadTime', 'ENRechargeDelay', 'TotalWeight',
	'TotalArmsLoad', 'TotalLoad', 'TotalENLoad', 'ATKHeatBuildup', 'ChgHeatBuildup', 
	'Recoil', 'ChgENLoad', 'ChgAmmoConsumption', 'FullChgTime', 'FullChgAmmoConsump', 
	'FullChgHeatBuildup', 'ChargeTime', 'DplyHeatBuildup', 'HomingLockTime', 'ReloadTime', 
	'AmmunitionCost', 'ScanStandbyTime', 'QBReloadTime', 'ABENConsumption', 
	'MeleeAtkENConsumption', 'Weight', 'ENLoad', 'CurrentLoad', 'CurrentArmsLoad', 
	'CurrentENLoad', 'ENRechargeDelayRedline', 'QBENRechargeTime', 'FullRechargeTime',
	'FullRechargeTimeRedline', 'UpwardENConsumption','MeleeAtkENConsump', 
	'CoolingDelay', 'ReloadTimeOverheat', 'AverageRecoil', 'MaxRecoilAngle',
	'UpwardEconomy', 'AssaultBoostEconomy'];

function isBetter(name, a, b) {
	if (lowerIsBetter.includes(name))
		return a < b
	else
		return a > b
}

const [blue, red] = ['rgb(62, 152, 254)', 'rgb(253, 52, 45)'];

/***************************************************************************************/

function toScore(val, min, max) {
	if(max === min)
		return 100
	else
		// When using modified part stats (from e.g. Melee Specialization) val might be larger
		// than max so we clip it. In principle we could recompute the max but it's a pain
		return Math.min(100, Math.max((val - min) / (max - min) * 100, 2));
}

const barDivShrink = '96%';

// AC bar-only stats. For these lower is better but the stats should not be inverted
const avoidInvertingBar = ['CurrentLoad', 'CurrentArmsLoad', 'CurrentENLoad']

const StatBar = ({kind, name, left, right, limit, color}) => {

	const normalizationKey = useContext(BuilderStateContext).normalizationKey;

	let min, max;
	if(kind !== undefined) {
		let source;
		if(normalizationKey === '')
			source = glob.partStatsRanges;
		else
			source = glob.normalizedStatsRanges[normalizationKey];
		[min, max] = source[kind][name];
	}
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

const doubleArrowChar = '\u00bb';
const upwardsTriangleChar = '\u23f6';
const downwardsTriangleChar = '\u23f7';
const longDashCharacter = '\u2012';

const namePadding = '4px 0px';

const NumericRow = ({name, leftRaw, rightRaw, kind, tooltip, buildCompareMode}) => {

	let [left, leftDisplay] = glob.toValueAndDisplayNumber(name, leftRaw);
	let [right, rightDisplay] = glob.toValueAndDisplayNumber(name, rightRaw);

	let rightColor = 'white';
	let triangle = '';
	if(typeof left === 'number') { // Comparison with left field present
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
		// kind !== undefined indicates we are creating a row for the part stats panel and
		// there will be a bar as well, so nameW has to shrink and barW is used. If 
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
					<StatBar 
						kind={kind}
						name={name}
						left={left}
						right={right}
						color={rightColor}
					/>
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
	const [round0, round1] = [Math.round(values[0]), Math.round(values[1])];
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

const RecoilPlot = ({left, right}) => {

	let data = [
		{
			x: right.map(([x, y]) => x),
			y: right.map(([x, y]) => y),
			mode: 'lines',
			line: {color: cyan}
		}
	];

	if(left)
		data.push(
			{
				x: left.map(([x, y]) => x),
				y: left.map(([x, y]) => y),
				mode: 'lines',
				line: {dash: '2px,2px', color: cyan}
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
					range: [0, 5],
					title: {text: 'Time', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				yaxis: {
					range: [0, 105],
					title: {text: 'Recoil', font: font, standoff: 1},
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

const RecoilPlotRow = ({name, left, right, tooltip}) => {
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
				<RecoilPlot left={left} right={right} />
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

const NoComparisonNumericRow = ({name, leftRaw, rightRaw, tooltip}) => {

	let [, leftDisplay] = glob.toValueAndDisplayNumber(name, leftRaw);
	let [, rightDisplay] = glob.toValueAndDisplayNumber(name, rightRaw);

	if(!leftDisplay)
		leftDisplay = longDashCharacter
	return (
		<>
		<div 
			style={{display: 'inline-block', width: '15px', verticalAlign: 'middle'}}
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
			{leftDisplay}
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
			{rightDisplay}
		</div>
	</>
	);
}

/**********************************************************************************/

const aimAssistGraphDesc = 'Gives an indication of how well the FCS is paired with the ' +
	'unit ranges. Shows the FCS aim assist at close/medium/long range (horizontal cyan ' +
	'lines) and unit ideal ranges (vertical red lines), arbitrarily capped at 300m.';

const enRecoveryGraphDesc = 'Shows the energy recovered over time in the normal (cyan) ' +
	'and redlining (red) cases.';

const fireAnimationNote = 'NOTE: all DPS/IPS related specs assume that the fire animation ' +
	'time is zero, so they are an overestimate when that is not the case (e.g. missile ' +
	'launchers that fire individual missiles in rapid sequence or heavy back weapons with ' +
	'delayed fire).'

const enRecoveryGraphNote = 'NOTE: the cyan Graph is a limit case because if the ' +
	'generator is not fully depleted energy recovery will not start from zero energy.';

const overheatUnitsReloadNote = 'NOTE: when comparing this stat between a unit with true ' +
	'reload and a unit with heating/cooling mechanics, keep in mind that heating/cooling ' +
	'is an inherently superior reload mechanism that generally allows for less downtime.'

const statTooltips = {
	'EffectiveAPKinetic': 'Amount of raw kinetic damage that can be sustained.',
	'EffectiveAPEnergy': 'Amount of raw energy damage that can be sustained.',
	'EffectiveAPExplosive': 'Amount of raw explosive damage that can be sustained.',
	'EffectiveAPAvg': 'Average of all effective AP values.',
	'AimAssistGraph': aimAssistGraphDesc + ' When a new FCS is in preview, the current ' +
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
	'ENRecoveryGraph': enRecoveryGraphDesc + ' When a new part is in preview, the ' +
		'current graphs are shown with dashed lines and the new ones with solid ones.\n' + 
		enRecoveryGraphNote,
	'WeightByGroup': 'Shows the contributions of units (left), frame (middle) and inner ' +
		'parts (right) to the total weight.',
	'ENLoadByGroup': 'Shows the contributions of units (left), frame (middle) and inner ' +
		'parts (right) to the total energy load.',
	'Damage/s': 'Damage dealt per second, not counting reload / cooldown / lock time.\n' +
		fireAnimationNote,
	'Impact/s': 'Impact damage dealt per second, not counting reload / cooldown / lock ' +
		'time.\n' + fireAnimationNote,
	'AccumulativeImpact/s': 'Accumulated impact damage dealt per second, not counting ' +
		'reload / cooldown / lock time.\n' + fireAnimationNote,
	'Damage/sInclReload': 'Damage per second factoring in reload / cooldown / lock time, ' +
		'whichever is applicable.\n' + fireAnimationNote + '\n' + overheatUnitsReloadNote,
	'Impact/sInclReload': 'Impact per second factoring in reload / cooldown / lock time, ' +
		'whichever is applicable.\n' + fireAnimationNote + '\n' + overheatUnitsReloadNote,
	'AccImpact/sInclReload': 'Accumulative impact per second factoring in ' + 
		'reload / cooldown / lock time, whichever is applicable.\n' + fireAnimationNote + 
		'\n' + overheatUnitsReloadNote,
	'ComboDamage': 'Damage of full melee combo',
	'ComboImpact': 'Impact of full melee combo',
	'ComboAccumulativeImpact': 'Accumulative impact of full melee combo',
	'DirectAttackPower': 'Attack power on staggered opponents.',
	'DirectDamage/s': 'Damage per second on staggered opponents.\n' + fireAnimationNote,
	'ComboDirectDamage': 'Damage of full melee combo on staggered opponents.',
	'MagDumpTime': 'Time to continously fire a number of rounds equals to Magazine Rounds.',
	'MagazineRounds': 'For units with heating/cooling mechanics this is the number of ' +
		'rounds that can be continously fired up to one shot away from overheating.',
	'ReloadTime': 'For units with heating/cooling mechanics this is the time needed to ' +
		'completely cool down after having continously fired a number of rounds equals ' +
		'to Magazine Rounds.\n' + overheatUnitsReloadNote,
	'ReloadTimeOverheat': 'Time to completely cool down from overheating.',
	'CoolingDelay': 'Time for the weapon to start cooling when not overheated.',
	'ChgDirectAttackPower': 'Charged attack power on staggered opponents.',
	'FullChgDirectAttackPower': 'Fully charged attack power on staggered opponents.',
	'MaxRecoilAngle': 'Maximum firing direction error at maximum accumulated recoil (100).',
	'GroundedBoostSpeed': 'Boost speed on the ground. Same as aerial boost speed except ' +
		'for tank legs.',
	'AerialBoostSpeed': 'Horizontal boost speed in the air. Same as grounded boost speed ' +
		'except for tank legs.',
	'UpwardSpeed': 'Speed when flying upwards.',
	'AssaultBoostSpeed': 'Stable assault boost speed.',
	'MeleeBoostSpeed': 'Melee boost speed.',
	'HoverSpeed': 'Tetrapod hover speed.',
	'HoverQBSpeed': 'Tetrapod quick boost speed while hovering.',
	'UpwardEconomy': 'Energy spent to travel 1m upwards.',
	'AssaultBoostEconomy': 'Energy spent to travel 1m when assault boosting.',
	'RecoilAccumulationGraph': 'Simulates firing all units with a rapid fire spec ' +
		'simultaneously at maximum fire rate and tracks the accumulated recoil over time. ' +
		'The simulation lasts 5s and includes reload/cooldown downtimes. Back units which ' +
		'interrupt arm units are excluded. Recoil caps at 100. When a new part that changes ' +
		'the simulation is in preview, the old graph is shown with dashed lines and the new ' +
		'one with solid lines.',
	'AverageRecoil': 'Average recoil incurred by each shot during the recoil accumulation ' +
		'simulation. An average of 0 indicates that recoil is always completely reabsorbed ' +
		'before the next shot. Recoil caps at 100.'
};

const statTooltipsComparerMode = {
	'AimAssistGraph': aimAssistGraphDesc + ' When two builds are compared, this build\'s ' +
		'FCS assist values are shown with solid lines and the ones from the other build with ' +
		'dashed lines.',
	'ENRecoveryGraph': enRecoveryGraphDesc + ' When two builds are compared, this ' +
		'build\'s Graphs are shown with solid lines and the ones from the other build with ' +
		'dashed lines.\n' + enRecoveryGraphNote
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
	else if(rightStat.type === 'RecoilPlot') {
		return(
			<RecoilPlotRow
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
				leftRaw={leftStat.value}	
				rightRaw={rightStat.value}
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
