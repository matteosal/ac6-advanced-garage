import { useState } from 'react';

import {globPartsData, globPartImages, globSlotImages, globPartSlots, capitalizeFirstLetter, 
	toDisplayString, globNoneBooster} from '../Misc/Globals.js';

import StatsRow from './StatsRow.jsx';

/*****************************************************************************/

function toImageFileName(name) {
	return name.replaceAll(' ', '_').replaceAll('/', '_') + '.png'
}

const SlotSelector = ({slot, inactive, border, updateSlot}) => {
	let style = {display: 'inline-block'};
	if(border)
		style['border'] = 'solid';
	if(inactive)
		style['color'] = 'gray';

	const img = globSlotImages[toImageFileName(slot)];

	toDisplayString(slot).toUpperCase();

	return (
		<div 
			style = {style}
			onMouseEnter = {() => {
				if(inactive) {
					return
				} else {
					updateSlot()
				}
			}}
		>
			<img src={img} width='60px' />
		</div>
	)
}

/*****************************************************************************/

const PartSelector = ({part, border, updatePreview, clearPreview, updateAssembly}) => {
	let style = {};
	if(border)
		style['border'] = 'solid';

	const img = globPartImages[toImageFileName(part.Name)];

	return (
		<div 
			style = {style}
			onMouseEnter = {updatePreview}
			onMouseLeave = {clearPreview}
			onClick = {updateAssembly}
		>
		{
			img === undefined ?
				<div>{part.Name}</div> :
				<img src={img} width='220px' />
		}
		</div>
	)
}

function getDisplayedParts(slot, searchString) {
	// Get all parts for the slot. This is not smart because it could be precomputed for 
	// every slot
	let slotFilterFunc;
	const slotCapitalized = slot == 'fcs' ? 'FCS' : capitalizeFirstLetter(slot);

	if(['rightArm', 'leftArm', 'rightBack', 'leftBack'].includes(slot)) {
		slotFilterFunc = part => (part.Kind === 'Unit' && part[slotCapitalized]);
	} else if(slot === 'booster') {
		// The None booster exists because of the tank legs but the user should not be allowed
		// to set it manually
		slotFilterFunc = part => 
			(part.Kind === slotCapitalized && part['ID'] != globNoneBooster['ID']);
	} else {
		slotFilterFunc = part => (part.Kind === slotCapitalized);
	}
	let output = globPartsData.filter(slotFilterFunc);

	const nonePart = output.find(part => part['Name'] === '(NOTHING)');

	// Filter by user query
	if(searchString != '') {
		const query = searchString.toLowerCase();
		output = output.filter(part => part['Name'].toLowerCase().includes(query));
	}

	// If none part was there before search filter ensure it's still there and put it at
	// the top
	if(nonePart != undefined) {
		output = output.filter(part => part['Name'] != '(NOTHING)');
		output.unshift(nonePart);
	}

	return output;
}

const PartList = (params) => {
	const {slot, previewDispatch, curPart, acPartsDispatch, previewPart,
		searchString, setSearchString} = params;

	const displayedParts = getDisplayedParts(slot, searchString);

	const drawBorder = part => 
		part['ID'] === curPart['ID'] ||
		(previewPart != null && part['ID'] === previewPart['ID']);

	const clearPreview = () => {
		previewDispatch({part: null})
		acPartsDispatch({target: 'preview', setNull: true})		
	}
	const updatePreview = part => {
		if(part['ID'] != curPart['ID']) {
			previewDispatch({part: part})
			acPartsDispatch({target: 'preview', slot: slot, id: part['ID']})
		} else {
			clearPreview()
		}
	}
	const updateAssembly = part => {
		acPartsDispatch({target: 'current', slot: slot, id: part['ID']})
		clearPreview()
		previewDispatch({slot: null})							
	}

	return(
		<>
		<div style={{height: '700px', overflowY: 'auto'}}>
		<input value={searchString} onChange={event => setSearchString(event.target.value)}/>
		{
			displayedParts.map(
				(part) => <PartSelector
					part = {part}
					border = {drawBorder(part)}
					updatePreview = {() => updatePreview(part)}
					clearPreview = {clearPreview}
					updateAssembly = {() => updateAssembly(part)}					
					key = {part['ID']}
				/>
			)
		}
		</div>
		</>
	);
}

/*****************************************************************************/

const PartsExplorer = ({preview, previewDispatch, acParts, acPartsDispatch}) => {
	const [searchString, setSearchString] = useState('');

	return (
		<div style={{flex: '0 1 300px', minWidth: 0}}>
			<div style={{overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap'}}>
			{
				globPartSlots.map(
					(s) => <SlotSelector 
						slot = {s}
						inactive = {s === 'booster' && acParts.legs['LegType'] === 'Tank'}
						border = {s === preview.slot}
						updateSlot = {() => {
							previewDispatch({slot: s})
							previewDispatch({part: null})
							setSearchString('')
						}}
						key = {s}
					/>
				)
			}
			</div>
			<PartList
				slot = {preview.slot}
				previewDispatch={previewDispatch}
				curPart = {acParts[preview.slot]}
				acPartsDispatch = {acPartsDispatch}
				previewPart = {preview.part}
				searchString = {searchString}
				setSearchString = {setSearchString}
			/>
		</div>
	)
}

export default PartsExplorer;