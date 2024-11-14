import { useState } from 'react';

import * as glob from '../Misc/Globals.js';

import StatsRow from './StatsRow.jsx';

/*****************************************************************************/

const SlotBox = ({slot, inactive, selected, updateSlot}) => {
	let imgStyle = {};
	let borderColor = glob.paletteColor(2);
	if(selected) {
		imgStyle['filter'] = 'brightness(1.5)';
		borderColor = glob.paletteColor(4);
	}
	else if(inactive)
		imgStyle['filter'] = 'brightness(0.5)';

	const img = glob.slotImages[glob.toImageFileName(slot)];

	let mouseEnter;
	if(inactive)
		mouseEnter = () => {}
	else
		mouseEnter = () => updateSlot()

	return (
		<div 
			style={{
				display: 'inline-block',
				width: '20%',
				borderTopStyle: 'solid',
				borderTopWidth: '2px',
				borderTopColor: borderColor
			}}
			onMouseEnter={mouseEnter}
		>
			<img style={imgStyle} src={img} width='100%' />
		</div>
	)
}

const SlotSelector = ({preview, updateSlot, acParts}) => {

	const displayedPartSlots = glob.partSlots.filter(
		(s, pos) => pos >= preview.slotRange[0] && pos <= preview.slotRange[1]
	);

	return (
		<>
		<div style={{width: 'fit-content', margin: '0px auto 10px auto'}}>
			{glob.toDisplayString(preview.slot).toUpperCase()}
		</div>
		<div>
		{
				displayedPartSlots.map(
				(s) => <SlotBox 
					slot = {s}
					inactive = {s === 'booster' && acParts.legs['LegType'] === 'Tank'}
					selected = {s === preview.slot}
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

const PartBox = ({part, isSelected, isEquipped, updatePreview, clearPreview, updateAssembly}) => {

	const filter = isSelected ? 'brightness(1.3)' : 'none'

	const img = glob.partImages[glob.toImageFileName(part.Name)];

	return (
		<div 
			style = {{position: 'relative'}}
			onMouseEnter = {updatePreview}
			onMouseLeave = {clearPreview}
			onClick = {updateAssembly}
		>
			<div style={
				{maxWidth: 'fit-content', margin: '5px auto', filter: filter}
			}>
				{
					img === undefined ?
						<div style={{height: 140}}>
							{part.Name}
						</div> :
						<img src={img} width='220px' style={{display: 'block'}} />
				}
			</div>
			{
				isEquipped ? 
				<div style={
					{
						height: '40px', width: '40px',
						position: 'absolute', bottom: '73px', left: '33px',
						backgroundImage: '-webkit-linear-gradient(\
							-45deg,' +
							glob.paletteColor(4) + '50%,\
							transparent 50%\
						)'
					}
				}>
					EQ
				</div> : 
				<></>
			}
		</div>
	)
}

function getDisplayedParts(slot, searchString) {
	// Get all parts for the slot. This is not smart because it could be precomputed for 
	// every slot
	let slotFilterFunc;
	const slotCapitalized = slot == 'fcs' ? 'FCS' : glob.capitalizeFirstLetter(slot);

	if(['rightArm', 'leftArm', 'rightBack', 'leftBack'].includes(slot)) {
		slotFilterFunc = part => (part.Kind === 'Unit' && part[slotCapitalized]);
	} else if(slot === 'booster') {
		// The None booster exists because of the tank legs but the user should not be allowed
		// to set it manually
		slotFilterFunc = part => 
			(part.Kind === slotCapitalized && part['ID'] != glob.noneBooster['ID']);
	} else {
		slotFilterFunc = part => (part.Kind === slotCapitalized);
	}
	let output = glob.partsData.filter(slotFilterFunc);

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

	const isSelected = part => 
		preview.part != null && part['ID'] === preview.part['ID'];

	const isEquipped = part => 
		part['ID'] === curPart['ID']

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
		<div style={{width: '90%', margin: 'auto'}}>
			<div style={{display: 'inline-block', width: '30%'}}>SEARCH:</div>
			<input
				className="my-input"
				style={{
					height: '30px',
					width: '70%',
					margin: '5px 0px 10px 0px',
					textTransform: 'uppercase'
				}}
				value={searchString}
				onChange={onSearch}
			/>
		</div>
		<div className="my-scrollbar" style={{height: '600px', overflowY: 'auto'}}>
		{
			displayedParts.map(
				(part) => <PartBox
					part = {part}
					isSelected = {isSelected(part)}
					isEquipped = {isEquipped(part)}
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
		<div style={
			{
				...{height: '750px', padding: '15px 5px'},
				...glob.dottedBackgroundStyle
			}
		}>
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
		</div>
	)
}

export default PartsExplorer;