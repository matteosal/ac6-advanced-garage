import { useState, useContext, useEffect } from 'react';

import {ACPartsContext, ACPartsDispatchContext} from "../Contexts/ACPartsContext.jsx";

import * as glob from '../Misc/Globals.js';

/*****************************************************************************/

const SlotBox = ({slot, inactive, selected, updateSlot, backSubslot, setBacksubslot}) => {
	let imgStyle = {};
	let borderColor = glob.paletteColor(2);
	if(selected) {
		imgStyle['filter'] = 'brightness(1.5)';
		borderColor = glob.paletteColor(5);
	}
	else if(inactive)
		imgStyle['filter'] = 'brightness(0.5)';

	const img = glob.slotImages[glob.toImageFileName(slot)];

	return (
		<div style={{
				display: 'inline-block',
				width: '20%',
				borderTopStyle: 'solid',
				borderTopWidth: '2px',
				borderTopColor: borderColor,
				position: 'relative'
			}}>
			<div onMouseEnter={() => {if(!inactive) updateSlot()}}>
				<img style={imgStyle} src={img} width='100%' />
			</div>
			{
				['leftBack', 'rightBack'].includes(slot) ? 
					<>
					<div 
						style = {{
							position: 'absolute',
							height: '6px', width: '6px',
							background: selected && backSubslot === 0 ? 
								glob.paletteColor(5, 1, 1.5) : 
								'gray',
							bottom: '40px', left: '3px'
						}}
						onMouseEnter = {() => setBacksubslot(0)}
					></div>
					<div 
						style = {{
							position: 'absolute',
							height: '6px', width: '6px',
							background: selected && backSubslot === 1 ? 
								glob.paletteColor(5, 1, 1.5) : 
								'gray',
							bottom: '40px', left: '12px'
						}}
						onMouseEnter = {() => setBacksubslot(1)}
					></div>
					</> :
					<></>
			}
		</div>
	)
}

function getInitialSlotRange(slot) {
	const pos = glob.partSlots.indexOf(slot);
	const start = Math.min(Math.max(pos - 1, 0), glob.partSlots.length - 5);
	return [start, start + 4]
}

function shiftPos(pos, range, delta, maxPos, hasTankLegs, backSubslot, setBacksubslot) {
	if ((delta === 1 && pos === maxPos) || (delta === -1 && pos === 0))
		return [pos, range];
	// Compute new pos ID, managing back subslots
	if(pos === 1 && delta === 1)
		setBacksubslot(0);
	else if(pos === 4 && delta === -1)
		setBacksubslot(1);
	else if(pos === 2 || pos === 3) {
		// Here we basically move by half a step and check where we land
		const subpos = backSubslot === 0 ? pos : pos + 0.5;
		const newSubPos = subpos + delta / 2;
		const floor = Math.floor(newSubPos);
		if(floor === 1 || floor === 4)
			setBacksubslot(null);
		else {
			delta = floor - pos; // This might be 0 if we are only switching subslot
			setBacksubslot(Math.round(2 * (newSubPos - floor)))
		}
	}
	let newPos = pos + delta;
	if(newPos === 8 && hasTankLegs)
		newPos += delta;
	// Update slot range
	let newRange = range;
	if(
		(delta === 1 && newPos > range[1] - 1 && range[1] < maxPos) ||
		(delta === -1 && newPos < range[0] + 1 && range[0] > 0)
	)
		newRange = newRange.map(i => i + delta);
	return [newPos, newRange];
}

const SlotSelector = ({preview, backSubslot, setBacksubslot, previewDispatch, setSearchString}) => {
	const acParts = useContext(ACPartsContext).current;
	const acPartsDispatch = useContext(ACPartsDispatchContext);

	const [slotRange, setSlotRange] = useState(getInitialSlotRange(preview.slot));

	const displayedPartSlots = glob.partSlots.filter(
		(s, pos) => pos >= slotRange[0] && pos <= slotRange[1]
	);

	const moveSlot = delta => {
		setSearchString('');	
		const currentPos = glob.partSlots.indexOf(preview.slot);
		const maxPos = glob.partSlots.length - 1;			
		const hasTankLegs = acParts.legs['LegType'] === 'Tank';
		const [newPos, newRange] = 
			shiftPos(currentPos, slotRange, delta, maxPos, hasTankLegs, backSubslot, setBacksubslot);
		setSlotRange(newRange);
		previewDispatch({slot: glob.partSlots[newPos]});
		acPartsDispatch({target: 'preview', setNull: true});		
	}

	const handleKeyDown = (event) => {
		if(event.target.matches('input'))
			return
		switch (event.key) {
			case 'q':
				moveSlot(-1);
				break;
			case 'e':
				moveSlot(1);
				break;
		}
	}

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[handleKeyDown]
	);

	const updateSlot = (s) => {
		previewDispatch({slot: s});
		acPartsDispatch({target: 'preview', setNull: true});
		setSearchString('');
		if(['leftBack', 'rightBack'].includes(s)) {
			if(backSubslot === null)
				setBacksubslot(0)
		} else
			setBacksubslot(null)
	}

	return (
		<>
		<div style={{width: '100%'}}>
			<button 
				style={{display: 'inline-block', width: '20%', marginRight: '10%'}}
				onClick={() => moveSlot(-1)}
			>
				{'< (E)'}
			</button>
			<div style={{display: 'inline-block', textAlign: 'center', width: '40%', 
				marginBottom: '10px'}}>
				{glob.toDisplayString(preview.slot).toUpperCase()}
			</div>
			<button 
				style={{display: 'inline-block', width: '20%', marginLeft: '10%'}}
				onClick={() => moveSlot(1)}
			>
				{'(Q) >'}
			</button>
		</div>
		<div>
		{
				displayedPartSlots.map(
				(s) => <SlotBox 
					slot = {s}
					inactive = {s === 'booster' && acParts.legs['LegType'] === 'Tank'}
					selected = {s === preview.slot}
					updateSlot = {() => updateSlot(s)}
					backSubslot = {backSubslot}
					setBacksubslot = {setBacksubslot}
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

const EquippedTag = ({imgH, background}) => {
	const size = 40;
	const shift = imgH - size;
	return <div 
		style={{
			display: 'block',
			height: size, width: size,
			position: 'absolute', bottom: shift,
			backgroundImage: '-webkit-linear-gradient(\
				-45deg,' +
				background + '50%,\
				transparent 50%\
			)'
		}}
	>
		EQ
	</div>
}

const PartBox = ({part, previewDispatch, slot, highlighted, setHighlightedId}) => {

	const acPartsDispatch = useContext(ACPartsDispatchContext);
	const acParts = useContext(ACPartsContext).current;		
	const curPart = acParts[slot];

	const filter = highlighted ? 'brightness(1.3)' : 'none'

	const img = glob.partImages[glob.toImageFileName(part.Name)];

	const clearPreview = () => {
		previewDispatch({part: null})
		acPartsDispatch({target: 'preview', setNull: true})
	}
	const updatePreview = () => {
		if(part['ID'] !== curPart['ID']) {
			previewDispatch({part: part})
			acPartsDispatch({target: 'preview', slot: slot, id: part['ID']})
		} else {
			clearPreview()
		}
	}
	const updateAssembly = () => {
		acPartsDispatch({target: 'current', slot: slot, id: part['ID']})
		acPartsDispatch({target: 'preview', setNull: true})						
	}

	const [imgW, imgAspectRatio] = [220, 0.51];
	const imgH = Math.round(imgW * imgAspectRatio);

	const pairedPart = acParts[glob.pairedUnitSlots[slot]];

	return (
		<div 
			style = {{margin: '5px auto', position: 'relative', filter: filter, height: imgH, width: imgW, background: glob.paletteColor(4)}}
			onMouseEnter = {() => {setHighlightedId(part['ID']); updatePreview();}}
			onClick = {updateAssembly}
		>
			{
				img === undefined ?
					<PartNameDisplay name={part['Name']} imgSize={[imgW, imgH]} /> :
					<img src={img} width={imgW} style={{display: 'block'}} />
			}
			{
				part['ID'] === curPart['ID'] ?
					<EquippedTag background={glob.paletteColor(5)} imgH={imgH}/> :
					<></>}
			{
				(
					pairedPart !== undefined && 
					part['ID'] === pairedPart['ID'] &&
					part['ID'] !== glob.noneUnit['ID']
				) ?
					<EquippedTag background='rgb(220, 52, 45)' imgH={imgH}/> : 
					<></>
			}
		</div>
	)
}

function getDisplayedParts(slot, backSubslot, searchString) {
	// Get all parts for the slot. This is not smart because it could be precomputed for 
	// every slot (save for search filtering and sorting)
	let slotFilterFunc;
	const slotCapitalized = slot == 'fcs' ? 'FCS' : glob.capitalizeFirstLetter(slot);

	if(['rightArm', 'leftArm'].includes(slot)) {
		slotFilterFunc = part => (part.Kind === 'Unit' && part[slotCapitalized]);
	} else 
	if(['rightBack', 'leftBack'].includes(slot)) {
		const pairedSlotCapitalized = glob.capitalizeFirstLetter(glob.pairedUnitSlots[slot]);
		if(backSubslot === 0)
			// Actual back units. The convoluted filter indicates something should be refactored,
			// maybe the parts data
			slotFilterFunc = part => (
				part.Kind === 'Unit' && 
				(
					(part[slotCapitalized] && !part[pairedSlotCapitalized]) || 
					part['ID'] === glob.noneUnit['ID']
				)
			);
		else
			// Arm units for back slot
			slotFilterFunc = part => (
				part.Kind === 'Unit' && part[slotCapitalized] && part[pairedSlotCapitalized]
			);
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

const PartSelector = ({preview, previewDispatch, searchString, onSearch, backSubslot}) => {

	const [highlightedId, setHighlightedId] = useState(-1);

	const displayedParts = getDisplayedParts(preview.slot, backSubslot, searchString);

	return(
		<>
		<div style={{width: '90%', margin: 'auto'}}>
			<div style={{display: 'inline-block', width: '30%'}}>SEARCH:</div>
			<input
				style={{
					height: '30px',
					width: '70%',
					margin: '5px 0px 10px 0px',
					textTransform: 'uppercase',
					backgroundColor: glob.paletteColor(3)
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
					slot = {preview.slot}
					highlighted = {part['ID'] == highlightedId}
					setHighlightedId = {setHighlightedId}
					key = {part['ID']}
				/>
			)
		}
		</div>
		</>
	);
}

/*****************************************************************************/

const PartsExplorer = ({preview, previewDispatch}) => {

	const acParts = useContext(ACPartsContext).current;	
	const acPartsDispatch = useContext(ACPartsDispatchContext);

	const [searchString, setSearchString] = useState('');
	const [backSubslot, setBacksubslot] = useState(
		['leftBack', 'rightBack'].includes(preview.slot) ? 0 : null
	);

	const handleKeyDown = (event) => {
		if(event.target.matches('input'))
			return
		if(event.key === 'Escape') {
			previewDispatch({slot: null})
			acPartsDispatch({target: 'preview', setNull: true})
		}
	}

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[handleKeyDown]
	);

	return (
		<div style={
			{
				...{height: '750px', padding: '15px 5px'},
				...glob.dottedBackgroundStyle
			}
		}>
			<SlotSelector
				preview={preview}
				backSubslot={backSubslot}
				setBacksubslot={setBacksubslot}
				previewDispatch={previewDispatch}
				setSearchString={setSearchString}
			/>
			<PartSelector
				preview = {preview}
				previewDispatch={previewDispatch}
				searchString = {searchString}
				backSubslot = {backSubslot}
				onSearch = {event => setSearchString(event.target.value)}
			/>
		</div>
	)
}

export default PartsExplorer;