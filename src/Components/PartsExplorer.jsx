import { useState } from 'react';

import {globPartsData, globPartImages, globSlotImages, globPartSlots, capitalizeFirstLetter, 
	toDisplayString, globNoneBooster} from '../Misc/Globals.js';

import StatsRow from './StatsRow.jsx';

/*****************************************************************************/

function toImageFileName(name) {
	return name.replaceAll(' ', '_').replaceAll('/', '_') + '.png'
}

const SlotBox = ({slot, inactive, border, updateSlot}) => {
	let style = {display: 'inline-block'};
	let imgStyle = {};
	if(border)
		style['border'] = 'solid';
	if(inactive)
		imgStyle['filter'] = 'brightness(0.5)';

	const img = globSlotImages[toImageFileName(slot)];

	let mouseEnter;
	if(inactive)
		mouseEnter = () => {}
	else
		mouseEnter = () => updateSlot()

	// ;
	return (
		<div style={style} onMouseEnter={mouseEnter}>
			<img style={imgStyle} src={img} width='58px' />
		</div>
	)
}

const SlotSelector = ({preview, updateSlot, acParts}) => {

	const displayedPartSlots = globPartSlots.filter(
		(s, pos) => pos >= preview.slotRange[0] && pos <= preview.slotRange[1]
	);

	return (
		<>
		<div style={{maxWidth: 'fit-content', margin: '0px auto 0px auto'}}>
			{toDisplayString(preview.slot).toUpperCase()}
		</div>
		<div>
		{
				displayedPartSlots.map(
				(s) => <SlotBox 
					slot = {s}
					inactive = {s === 'booster' && acParts.legs['LegType'] === 'Tank'}
					border = {s === preview.slot}
					updateSlot = {() => updateSlot(s)}
					key = {s}
				/>
			)
		}
		</div>
		</>
	)
}

/*****************************************************************************/

const PartBox = ({part, border, updatePreview, clearPreview, updateAssembly}) => {
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
			<div style={{maxWidth: 'fit-content', margin: '0px auto 0px auto'}}>
				{
					img === undefined ?
						<div style={{height: 144}}>
							{part.Name}
						</div> :
						<img src={img} width='280px' />
				}
			</div>
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

const PartSelector = (params) => {
	const {preview, previewDispatch, curPart, acPartsDispatch,
		searchString, onSearch} = params;

	const displayedParts = getDisplayedParts(preview.slot, searchString);

	const drawBorder = part => 
		part['ID'] === curPart['ID'] || // part is equipped
		(preview.part != null && part['ID'] === preview.part['ID']); // part is in preview

	const clearPreview = () => {
		previewDispatch({part: null})
		acPartsDispatch({target: 'preview', setNull: true})		
	}
	const updatePreview = part => {
		if(part['ID'] != curPart['ID']) {
			previewDispatch({part: part})
			acPartsDispatch({target: 'preview', slot: preview.slot, id: part['ID']})
		} else {
			clearPreview()
		}
	}
	const updateAssembly = part => {
		acPartsDispatch({target: 'current', slot: preview.slot, id: part['ID']})
		clearPreview()
		previewDispatch({slot: null})							
	}

	return(
		<>
		<div style={{height: '700px', overflowY: 'auto'}}>
		<input value={searchString} onChange={onSearch}/>
		{
			displayedParts.map(
				(part) => <PartBox
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
		<>
			<SlotSelector
				preview={preview}
				updateSlot = {(s) => {
						previewDispatch({slot: s})
						setSearchString('')
					}
				}
				acParts={acParts}
			/>
			<PartSelector
				preview = {preview}
				previewDispatch={previewDispatch}
				curPart = {acParts[preview.slot]}
				acPartsDispatch = {acPartsDispatch}
				searchString = {searchString}
				onSearch = {event => setSearchString(event.target.value)}
			/>
		</>
	)
}

export default PartsExplorer;