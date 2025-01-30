import { useContext } from 'react';

import {BuilderStateContext, BuilderStateDispatchContext} from 
	"../Contexts/BuilderStateContext.jsx";
import InfoBox from './InfoBox.jsx';
import {StatRow} from './StatRows.jsx';
import * as glob from '../Misc/Globals.js';

function toNullStats(part) {
	return Object.fromEntries(
		Object.entries(part).map(([k, v]) => [k, null])
	)
}

const UnitIcon = ({img}) => {
	return <img src={img} alt='unit icon' width='20px' 
		style={{margin: '0px 2px', border: 'solid 1px gray'}} />
}

const sortingNote = 'Part sorting will use these modified values.';
const modifiedSpecsTooltipText = 'Shows the effect of other currently equipped parts on ' +
	'the relevant unit specs: Melee Specialization from the arms, Energy Firearm ' + 
	'Specialization from the generator and Missile Lock Correction from the FCS. ' + 
	sortingNote;
const normalizeSpecsTooltipText = 'Can be set to divide specs by the current part\'s ' +
	'Weight and multiply them by 1000 or by the current part\'s EN Load and multiply them ' +
	'by 100. In other words, gives the spec values for 1000 Weight or for 100 EN. Weight ' +
	'and EN Load specs are left unchanged. ' + sortingNote;

const PartStatsHeader = ({part}) => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	let desc;
	if(part['Kind'] === 'Unit' && part['ID'] !== glob.noneUnit['ID']) {
		desc = part['Description']
	}
	else
		desc = part['Kind']

	const manufacturerLogo = part['Manufacturer'] ? 
		glob.manufacturerLogos[glob.toImageFileName(part['Manufacturer'])] :
		null;

	const toggleShowModifiedSpecs = () => stateDispatch(
		{target: 'showModifiedSpecs', value: !state.showModifiedSpecs}
	);
	const setNormalizationKey = event => stateDispatch(
		{target: 'normalizationKey', value: event.target.value}
	);

	return(
		<div style={{...glob.dottedBackgroundStyle(), ...{height: 100}}}>
			<div style={{display: 'inline-block', paddingTop: 10, paddingLeft: 20, 
				paddingBottom: 11}}>
				<div>{desc.toUpperCase()}</div>
				<div style={{fontSize: '160%'}}>{part['Name']}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right', paddingRight: 10}}>
				<img style={{display: 'block'}} alt={part['Manufacturer']} 
					src={manufacturerLogo} width='70px' />
			</div>
			<div 
				style={{display: 'flex', justifyContent: 'space-evenly', width: '100%'}}
			>
				<div>
					<div style={{display: 'inline-block', width: '15px', marginRight: 3}}>
						<InfoBox
							name='checkbox-tooltip'
							tooltip={modifiedSpecsTooltipText}
							place='bottom-start'
						/>
					</div>
					<label 
						style={{fontSize: '12px', position: 'relative', bottom: 2}}
						className='checkbox-tooltip-anchor'
						htmlFor='modified-stats-checkbox'
					>
						SHOW MODIFIED UNIT SPECS
					</label>
					<input
						type='checkbox'
						id='modified-stats-checkbox'
						className='checkbox-tooltip-anchor'
						style={{marginLeft: 5}}
					checked={state.showModifiedSpecs}
					onChange={toggleShowModifiedSpecs}
					/>
				</div>
				<div>
					<div style={{display: 'inline-block', width: '15px', marginRight: 3}}>
						<InfoBox
							name='checkbox-tooltip'
							tooltip={normalizeSpecsTooltipText}
							place='bottom-start'
						/>
					</div>				
					<label
						style={{fontSize: '12px', position: 'relative', bottom: 2}}
						htmlFor='normalize-dropdown'
					>
						NORMALIZE SPECS:
					</label>
					<select 
						style={{marginLeft: 5, fontSize: '12px', position: 'relative', bottom: 4}}
						id='normalize-dropdown'
						value={state.normalizationKey}
						onChange={setNormalizationKey}
					>
						<option value=''>None</option>
						<option value='Weight'>Weight</option>
						<option value='ENLoad'>EN Load</option>
					</select>
				</div>
			</div>
		</div>
	)
}

const noComparisonStats = ['MagDumpTime', 'BurstFireInterval'];

function toRowType(statName) {
	return noComparisonStats.includes(statName) ? 'NumericNoComparison' : 'Numeric'
}

const PartStatsBody = ({leftPart, rightPart}) => {

	let statGroups = glob.partStatGroups[rightPart['Kind']].map(
		group => group.filter(stat => rightPart[stat] !== undefined)
	);

	let leftStats = [];
	let rightStats = [];
	for(let i = 0; i < statGroups.length; i++) {
		statGroups[i].map(
			stat => {
				leftStats.push({name: stat, value: leftPart[stat], type: toRowType(stat)});
				rightStats.push({name: stat, value: rightPart[stat], type: toRowType(stat)});
				return null;
			}
		);
		if(statGroups[i].length > 0 && i < statGroups.length - 1){
			leftStats.push({type: 'EmptyLine'});
			rightStats.push({type: 'EmptyLine'});			
		}
	}

	const isUnit = rightPart['Kind'] === 'Unit' && rightPart['ID'] !== glob.noneUnit['ID']
	if(isUnit) {
		var atkTypeImg = glob.unitIcons[rightPart['AttackType'] + '.png'];
		var wpnTypeImg = glob.unitIcons[rightPart['WeaponType'] + '.png'];
		var rldTypeImg = glob.unitIcons[rightPart['ReloadType'] + '.png'];
		var addEffImg;
		if(rightPart['AdditionalEffect'] === undefined)
			addEffImg = glob.unitIcons['NoEffect.png']
		else
			addEffImg = glob.unitIcons[rightPart['AdditionalEffect'] + '.png'];		
	}

	const range = [...Array(rightStats.length).keys()];

	return(
		<div style={{...glob.dottedBackgroundStyle(), padding: '10px 15px'}}>
			<div style={{display: 'inline-block', fontSize: '12px', 
				padding: '0px 0px 10px 10px'}}>
				{glob.boxCharacter + ' PART SPECS'}
			</div>
			{
				isUnit ? 
					<div style={{display: 'inline-block', marginLeft: 410}}>
						<UnitIcon img={atkTypeImg} />
						<UnitIcon img={wpnTypeImg} />
						<UnitIcon img={rldTypeImg} />
						<UnitIcon img={addEffImg} />
					</div> :
				<></>
			}
		<div className="my-scrollbar" style={{maxHeight: '640px', overflowY: 'auto'}}>
			{
				range.map(
					(pos) => {
						return(
							<div style={{background: glob.tableRowBackground(pos)}} key={pos}>
								<StatRow 
									leftStat={leftStats[pos]}
									rightStat={rightStats[pos]}
									kind={rightPart['Kind']}
									pos={pos}								
								/>
							</div>
						)
					}
				)
			}
		</div>
		</div>
	)
}

function getNormalizedPartData(part, key) {
	return glob.normalizedPartsData[key][Number(part['ID'])];	
}

const PartStats = () => {

	const state = useContext(BuilderStateContext);

	const previewPart = state.preview.part;
	const curPart = state.parts[state.preview.slot];

	let leftPart, rightPart;
	if(previewPart === null) {
		let nullPart = toNullStats(curPart);
		[leftPart, rightPart] = [nullPart, curPart];
	}
	else {
		[leftPart, rightPart] = [curPart, previewPart];
	}

	// Stat normalization dropdown
	if(['Weight', 'ENLoad'].includes(state.normalizationKey)) {
		if(previewPart !== null)
			leftPart = getNormalizedPartData(leftPart, state.normalizationKey);
		rightPart = getNormalizedPartData(rightPart, state.normalizationKey);
	}

	// Stat modification checkbox
	if(state.showModifiedSpecs && rightPart['Kind'] === 'Unit') {
		if(previewPart !== null)
			leftPart = glob.getModifiedPartsData(leftPart, state.parts);
		rightPart = glob.getModifiedPartsData(rightPart, state.parts);
	}

	return (
		<>
		<div style={{marginBottom: 10}}>
			<PartStatsHeader part={rightPart} />
		</div>
		<PartStatsBody leftPart={leftPart} rightPart={rightPart} />
		</>
	);
}

export default PartStats;