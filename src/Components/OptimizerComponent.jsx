import { useContext, useEffect, useMemo, useState } from 'react';

import * as glob from '../Misc/Globals.js';
import {
	runOptimizationAsync, resolveEquipmentParts, headList, coreList, armsList, legsList,
	boosterList, fcsList, generatorList, unitLists
} from '../Misc/Optimizer.js';

import {OptimizerStateContext, OptimizerStateDispatchContext} from
	'../Contexts/OptimizerStateContext.jsx';

import OptimizerTable from './OptimizerTable.jsx';
import InfoBox from './InfoBox.jsx';

/***************************************************************************************/

const panelStyle = {
	...glob.dottedBackgroundStyle(),
	boxSizing: 'border-box',
	width: '100%',
	padding: '15px',
	margin: '10px 0px'
};

const fieldStyle = {width: '240px', marginBottom: '10px'};
const labelStyle = {display: 'block', fontSize: '12px', color: 'rgb(151, 173, 184)',
	marginBottom: '3px'};

const PanelHeader = ({title, info}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px'}}>
		<div style={{fontSize: '12px'}}>{glob.boxCharacter + ' ' + title}</div>
		{
			info ?
				<div style={{width: '14px'}}><InfoBox name={title} tooltip={info} place='right'/></div> :
				<></>
		}
	</div>
);

const NumberField = ({id, label, value, step, tooltip, onChange}) => {
	const [internal, setInternal] = useState(String(value));
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		if(!focused)
			setInternal(String(value));
	}, [value, focused]);

	const handleChange = event => {
		const val = event.target.value;
		setInternal(val);
		const num = Number(val);
		if(val !== '' && !Number.isNaN(num) && num >= 0)
			onChange(num);
	};

	const handleKeyPress = event => {
		if(!/[0-9.]/.test(event.key))
			event.preventDefault();
	};

	const handleBlur = () => {
		setFocused(false);
		const num = Number(internal);
		if(internal === '' || Number.isNaN(num) || num < 0)
			onChange(0);
	};

	return (
		<div style={fieldStyle}>
			<div style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px'}}>
				<label style={{...labelStyle, marginBottom: 0}} htmlFor={id}>{label}</label>
				{
					tooltip ?
						<div style={{width: '14px'}}>
							<InfoBox name={'threshold-' + id} tooltip={tooltip} place='right'/>
						</div> :
						<></>
				}
			</div>
			<input
				id={id}
				style={{width: '100%', boxSizing: 'border-box', padding: '4px 6px',
					backgroundColor: glob.paletteColor(3)}}
				value={internal}
				onChange={handleChange}
				onKeyPress={handleKeyPress}
				onFocus={() => setFocused(true)}
				onBlur={handleBlur}
			/>
		</div>
	);
};

const PartSelect = ({id, label, parts, value, onChange, allowAny, anyLabel}) => {
	return (
		<div style={fieldStyle}>
			<label style={labelStyle} htmlFor={id}>{label}</label>
			<select
				id={id}
				style={{width: '100%', boxSizing: 'border-box', padding: '4px 6px'}}
				value={value === null ? '' : value}
				onChange={event => onChange(event.target.value === '' ? null :
					Number(event.target.value))}
			>
				{allowAny ? <option value="">{anyLabel || 'ANY'}</option> : <></>}
				{
					parts.map(part => <option key={part['ID']} value={part['ID']}>
						{part['Name'].toUpperCase()}</option>)
				}
			</select>
		</div>
	);
};

const WeightSlider = ({id, label, value, onChange}) => {
	return (
		<div style={{width: '300px'}}>
			<div style={{display: 'flex', justifyContent: 'space-between'}}>
				<label style={labelStyle} htmlFor={id}>{label}</label>
				<span>{value}</span>
			</div>
			<input
				type="range"
				id={id}
				style={{width: '100%'}}
				min="0"
				max="5"
				step="0.5"
				value={value}
				onChange={event => onChange(Number(event.target.value))}
			/>
		</div>
	);
};

const ProgressBar = ({progress}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
		<div style={{width: '180px', height: '18px', border: '1px solid ' + glob.paletteColor(5),
			background: glob.paletteColor(0), overflow: 'hidden'}}>
			<div style={{width: (progress * 100) + '%', height: '100%',
				background: glob.paletteColor(5)}} />
		</div>
		<span style={{fontSize: '12px', minWidth: '38px'}}>{Math.round(progress * 100) + '%'}</span>
	</div>
);

const thresholdFields = [
	{key: 'meleeSpec', label: 'ARMS: MELEE SPEC \u2265', step: 1},
	{key: 'recoilControl', label: 'ARMS: RECOIL CONTROL \u2265', step: 1},
	{key: 'minQB', label: 'MIN. QBS (FULL EN)', step: 0.1,
		tooltip: 'Consecutive quick boosts from a full EN bar (capacity \u00f7 QB cost), not rounded.'},
	{key: 'minQBSpeed', label: 'MIN. QB SPEED', step: 1},
	{key: 'minBoostSpeed', label: 'MIN. BOOST SPEED', step: 1},
	{key: 'minABDistance', label: 'MIN. AB DISTANCE (M)', step: 1,
		tooltip: 'EN capacity \u00f7 AB EN use \u00d7 AB speed on one full bar with no regen.'},
	{key: 'minMeleeQB', label: 'MIN. MELEE + QB CYCLES', step: 0.1,
		tooltip: 'Melee + QB cycles = capacity \u00f7 (melee EN cost + QB cost), unrounded. ' +
			'Tank legs have no melee EN stat, so they fail any melee minimum.'},
	{key: 'minJumpDistance', label: 'LEGS: JUMP DISTANCE \u2265', step: 1},
	{key: 'maxQBRegen', label: 'MAX. 1 QB REGEN (S)', step: 0.05,
		tooltip: 'QB jet duration + time to regain one QB EN cost (no redline).'},
	{key: 'maxFullEN', label: 'MAX. FULL EN TIME (S)', step: 0.1,
		tooltip: 'Time to fully recharge EN from empty.'},
	{key: 'maxRedlineFull', label: 'MAX. REDLINE\u2192FULL (S)', step: 0.1,
		tooltip: 'Time to full EN from redline.'}
];

const legTypeList = ['Bipedal', 'Reverse-Joint', 'Tetrapod', 'Tank'];

const weightsInfo =
	'Score = weighted sum of effective AP and stability, each min-max normalized across the ' +
	'combinations currently allowed by your filters (so scores shift when filters change). ' +
	'Effective AP = total AP \u00d7 average total defense / 1000; stability = head + core + ' +
	'legs (arms do not contribute).';

/***************************************************************************************/

const OptimizerComponent = () => {

	const state = useContext(OptimizerStateContext);
	const stateDispatch = useContext(OptimizerStateDispatchContext);

	const [result, setResult] = useState(null);
	const [calculatedState, setCalculatedState] = useState(null);
	const [calculating, setCalculating] = useState(false);
	const [progress, setProgress] = useState(0);

	const equipmentParts = useMemo(() => resolveEquipmentParts(state.equipment),
		[state.equipment]);

	const setMaxWeight = value => stateDispatch({target: 'maxWeight', value: value});
	const setPart = (key, value) => stateDispatch({target: 'parts', key: key, value: value});
	const setEquipment = (key, value) => stateDispatch({target: 'equipment', key: key, value: value});
	const setThreshold = (key, value) => stateDispatch({target: 'thresholds', key: key, value: value});
	const setWeight = (key, value) => stateDispatch({target: 'weights', key: key, value: value});
	const toggleLegType = key => stateDispatch(
		{target: 'legTypes', key: key, value: !state.legTypes[key]}
	);
	const setStayWithinLoad = value => stateDispatch({target: 'stayWithinLoad', value: value});

	const handleCalculate = async () => {
		setCalculating(true);
		setProgress(0);
		const snapshot = state;
		const res = await runOptimizationAsync(snapshot, setProgress);
		setResult(res);
		setCalculatedState(snapshot);
		setCalculating(false);
	};

	const isStale = result !== null && calculatedState !== state;

	const equipmentWeight = equipmentParts.rightArm['Weight'] + equipmentParts.leftArm['Weight'] +
		equipmentParts.rightBack['Weight'] + equipmentParts.leftBack['Weight'] +
		equipmentParts.fcs['Weight'];
	const equipmentInfo =
		'Equipment weight: ' + Math.round(equipmentWeight).toLocaleString() +
		' (booster and generator are optimized unless fixed in the inputs)';
	const duplicateWarning =
		(equipmentParts.rightArm['ID'] !== glob.noneUnit['ID'] &&
			equipmentParts.rightArm['ID'] === equipmentParts.rightBack['ID']) ||
		(equipmentParts.leftArm['ID'] !== glob.noneUnit['ID'] &&
			equipmentParts.leftArm['ID'] === equipmentParts.leftBack['ID']) ?
		' — warning: the same unit is in an arm and back slot on one side; the garage rejects that' :
		'';

	const resultsInfo = result === null ? null :
		result.totalCount === 0 ?
			result.totalCount.toLocaleString() + ' valid combinations — nothing fits; raise max ' +
				'weight, lower thresholds, loosen filters or untick the load-limit option.' :
			result.totalCount.toLocaleString() + ' valid combinations' +
				(result.totalCount > 100 ? ' (showing top 100)' : '');

	return (
		<>
		<div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', ...panelStyle}}>
			<PanelHeader title='INPUTS' />
			<div style={{display: 'flex', flexWrap: 'wrap', width: '100%'}}>
				<NumberField id='optimizer-max-weight' label='MAX COMBINED WEIGHT'
					value={state.maxWeight} step={500}
					tooltip='Maximum total weight of the entire AC (all parts).'
					onChange={setMaxWeight} />
				<PartSelect id='optimizer-part-head' label='HEAD' parts={headList}
					value={state.parts.head} allowAny
					onChange={value => setPart('head', value)} />
				<PartSelect id='optimizer-part-core' label='CORE (BODY)' parts={coreList}
					value={state.parts.core} allowAny
					onChange={value => setPart('core', value)} />
				<PartSelect id='optimizer-part-arms' label='ARMS' parts={armsList}
					value={state.parts.arms} allowAny
					onChange={value => setPart('arms', value)} />
				<PartSelect id='optimizer-part-legs' label='LEGS' parts={legsList}
					value={state.parts.legs} allowAny
					onChange={value => setPart('legs', value)} />
				<PartSelect id='optimizer-part-booster' label='BOOSTER' parts={boosterList}
					value={state.parts.booster} allowAny
					onChange={value => setPart('booster', value)} />
				<PartSelect id='optimizer-part-generator' label='GENERATOR' parts={generatorList}
					value={state.parts.generator} allowAny
					onChange={value => setPart('generator', value)} />
				<div style={fieldStyle}>
					<label style={labelStyle}>LEG TYPES</label>
					<div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
						{
							legTypeList.map(
								type => <label key={type} style={{fontSize: '13px'}}>
									<input type="checkbox" checked={state.legTypes[type]}
										onChange={() => toggleLegType(type)} />
									{' ' + type.toUpperCase()}
								</label>
							)
						}
					</div>
				</div>
				<div style={fieldStyle}>
					<label style={labelStyle}>&nbsp;</label>
					<label style={{fontSize: '13px'}}>
						<input type="checkbox" checked={state.stayWithinLoad}
							onChange={event => setStayWithinLoad(event.target.checked)} />
						{' STAY WITHIN LOAD LIMITS'}
					</label>
				</div>
			</div>
		</div>

		<div style={panelStyle}>
			<PanelHeader title='OTHER EQUIPMENT'
				info={'Other equipment is only used for total weight and EN load (not scored).'} />
			<div style={{display: 'flex', flexWrap: 'wrap'}}>
				<PartSelect id='optimizer-right-arm' label='R-ARM UNIT' parts={unitLists.rightArm}
					value={state.equipment.rightArm}
					onChange={value => setEquipment('rightArm', value)} />
				<PartSelect id='optimizer-left-arm' label='L-ARM UNIT' parts={unitLists.leftArm}
					value={state.equipment.leftArm}
					onChange={value => setEquipment('leftArm', value)} />
				<PartSelect id='optimizer-right-back' label='R-BACK UNIT' parts={unitLists.rightBack}
					value={state.equipment.rightBack}
					onChange={value => setEquipment('rightBack', value)} />
				<PartSelect id='optimizer-left-back' label='L-BACK UNIT' parts={unitLists.leftBack}
					value={state.equipment.leftBack}
					onChange={value => setEquipment('leftBack', value)} />
				<PartSelect id='optimizer-fcs' label='FCS' parts={fcsList}
					value={state.equipment.fcs}
					onChange={value => setEquipment('fcs', value)} />
			</div>
			<div style={{fontSize: '12px', color: 'rgb(151, 173, 184)'}}>
				{equipmentInfo + duplicateWarning}
			</div>
		</div>

		<div style={panelStyle}>
			<PanelHeader title='THRESHOLDS' />
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}>
				{
					thresholdFields.map(
						field => <NumberField key={field.key}
							id={'optimizer-threshold-' + field.key}
							label={field.label}
							value={state.thresholds[field.key]}
							step={field.step}
							tooltip={field.tooltip}
							onChange={value => setThreshold(field.key, value)} />
					)
				}
			</div>
		</div>

		<div style={{...panelStyle, display: 'flex', justifyContent: 'space-evenly',
			alignItems: 'center'}}>
			<PanelHeader title='SCORE WEIGHTS' info={weightsInfo} />
			<div style={{display: 'flex', gap: '40px', width: '100%',
				justifyContent: 'space-evenly'}}>
				<WeightSlider id='optimizer-weight-effap' label='EFFECTIVE AP WEIGHT'
					value={state.weights.effAP}
					onChange={value => setWeight('effAP', value)} />
				<WeightSlider id='optimizer-weight-stability' label='STABILITY WEIGHT'
					value={state.weights.stability}
					onChange={value => setWeight('stability', value)} />
			</div>
		</div>

		<div style={panelStyle}>
			<div style={{display: 'flex', alignItems: 'center', gap: '15px',
				marginBottom: '10px'}}>
				<div style={{fontSize: '12px'}}>{glob.boxCharacter + ' RESULTS'}</div>
				<button onClick={handleCalculate} disabled={calculating}>
					{calculating ? 'CALCULATING...' : 'CALCULATE'}
				</button>
				{calculating ? <ProgressBar progress={progress} /> : <></>}
			</div>
			{
				result === null ?
					<div style={{fontSize: '12px', color: 'rgb(151, 173, 184)'}}>
						Press CALCULATE to run the search.
					</div> :
					<>
						{
							isStale ?
								<div style={{fontSize: '12px', color: 'rgb(221, 51, 51)',
									marginBottom: '10px'}}>
									Results may be out of date — inputs changed since the last
									calculation.
								</div> :
								<></>
						}
						<div style={{fontSize: '12px', color: 'rgb(151, 173, 184)',
							marginBottom: '10px'}}>
							{resultsInfo}
						</div>
						<OptimizerTable rows={result.rows} equipment={equipmentParts} />
					</>
			}
		</div>
		</>
	);
};

export default OptimizerComponent;
