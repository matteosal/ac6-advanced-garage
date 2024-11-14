import { useState } from 'react';

import * as glob from '../Misc/Globals.js';

import StatsRow from './StatsRow.jsx';

/*****************************************************************************/

const SlotBox = ({slot, inactive, selected, updateSlot}) => {
	let imgStyle = {};
	let borderColor = glob.paletteColor(2);
	if(selected) {
		imgStyle['filter'] = 'brightness(1.5)';
		borderColor = glob.paletteColor(5);
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

const PartNameDisplay = ({name, imgSize}) => {
	return <div 
		style={{
			display: 'flex',
			height: '100%', width: '100%'
		}}>
			<div style={{margin: 'auto'}}>{name}</div>
	</div>
}

const EquippedTag = ({imgH}) => {
	const size = 40;
	const shift = imgH - size;
	return <div 
		style={{
			display: 'block',
			height: size, width: size,
			position: 'absolute', bottom: shift,
			backgroundImage: '-webkit-linear-gradient(\
				-45deg,' +
				glob.paletteColor(5) + '50%,\
				transparent 50%\
			)'
		}}
	>
		EQ
	</div>
}

const PartBox = ({part, previewDispatch, acPartsDispatch, curPart, slot}) => {

	const [highlighted, setHighlighted] = useState(false)

	const filter = highlighted ? 'brightness(1.3)' : 'none'

	const img = glob.partImages[glob.toImageFileName(part.Name)];

	const clearPreview = () => {
		previewDispatch({part: null})
		acPartsDispatch({target: 'preview', setNull: true})		
	}
	const updatePreview = () => {
		if(part['ID'] != curPart['ID']) {
			previewDispatch({part: part})
			acPartsDispatch({target: 'preview', slot: slot, id: part['ID']})
		} else {
			clearPreview()
		}
	}
	const updateAssembly = () => {
		acPartsDispatch({target: 'current', slot: slot, id: part['ID']})
		acPartsDispatch({target: 'preview', setNull: true})
		previewDispatch({slot: null})							
	}

	const [imgW, imgAspectRatio] = [220, 0.51];
	const imgH = Math.round(imgW * imgAspectRatio);

	return (
		<div 
			style = {{margin: '5px auto', position: 'relative', filter: filter, height: imgH, width: imgW, background: glob.paletteColor(4)}}
			onMouseEnter = {() => {setHighlighted(true); updatePreview();}}
			onMouseLeave = {() => {setHighlighted(false); clearPreview();}}
			onClick = {updateAssembly}
		>
			{
				img === undefined ?
					<PartNameDisplay name={part['Name']} imgSize={[imgW, imgH]} /> :
					<img src={img} width={imgW} style={{display: 'block'}} />
			}
			{part['ID'] === curPart['ID'] ? <EquippedTag imgH={imgH}/> : <></>}
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
					previewDispatch = {previewDispatch}
					acPartsDispatch = {acPartsDispatch}
					curPart = {curPart}
					slot = {preview.slot}
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