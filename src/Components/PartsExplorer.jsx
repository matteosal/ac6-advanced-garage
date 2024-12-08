import { useState, useContext, useEffect, useCallback } from 'react';


import * as glob from '../Misc/Globals.js';
import {BuilderStateContext, BuilderStateDispatchContext} from 
	"../Contexts/BuilderStateContext.jsx";
import ModalWrapper from './ModalWrapper.jsx'
import ClosableTooltip from './ClosableTooltip.jsx'

/*****************************************************************************/

const SlotBox = ({slot, inactive, selected, updateSlot}) => {

	const backSubslot = useContext(BuilderStateContext).backSubslot;
	const stateDispatch = useContext(BuilderStateDispatchContext);

	const [highlighted, setHighlighted] = useState(false);

	let imgStyle = {};
	let borderColor = glob.paletteColor(2);
	if(selected) {
		imgStyle['filter'] = 'brightness(1.6)';
		borderColor = glob.paletteColor(5);
	}
	else if(highlighted)
		imgStyle['filter'] = 'brightness(1.3)';
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
				position: 'relative',
				cursor: inactive ? 'auto' : 'pointer'
			}}>
			<div 
				onMouseEnter={() => {if(!inactive) setHighlighted(true)}}
				onMouseLeave={() => {if(!inactive) setHighlighted(false)}}
				onClick={() => {if(!inactive) updateSlot()}}
			>
				<img style={imgStyle} src={img} alt={slot} width='100%' />
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
							bottom: '39px', left: '3px'
						}}
						onClick = {() => {
							if(selected) stateDispatch({target: 'backSubslot', value: 0})
						}}
					></div>
					<div 
						style = {{
							position: 'absolute',
							height: '6px', width: '6px',
							background: selected && backSubslot === 1 ? 
								glob.paletteColor(5, 1, 1.5) : 
								'gray',
							bottom: '39px', left: '12px'
						}}
						onClick = {() => {
							if(selected) stateDispatch({target: 'backSubslot', value: 1})
						}}
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

function shiftPos(pos, range, delta, maxPos, hasTankLegs, backSubslot, setBackSubslot) {
	if ((delta === 1 && pos === maxPos) || (delta === -1 && pos === 0))
		return [pos, range];
	// Compute new pos ID, managing back subslots
	if(pos === 1 && delta === 1)
		setBackSubslot(0);
	else if(pos === 4 && delta === -1)
		setBackSubslot(1);
	else if(pos === 2 || pos === 3) {
		// Here we basically move by half a step and check where we land
		const subpos = backSubslot === 0 ? pos : pos + 0.5;
		const newSubPos = subpos + delta / 2;
		const floor = Math.floor(newSubPos);
		if(floor === 1 || floor === 4)
			setBackSubslot(0);
		else {
			delta = floor - pos; // This might be 0 if we are only switching subslot
			setBackSubslot(Math.round(2 * (newSubPos - floor)))
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

const SlotSelector = ({setSearchString, modal}) => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	const acParts = state.parts;
	const previewSlot = state.preview.slot;
	const backSubslot = state.backSubslot;

	const [slotRange, setSlotRange] = useState(getInitialSlotRange(previewSlot));

	const displayedPartSlots = glob.partSlots.filter(
		(s, pos) => pos >= slotRange[0] && pos <= slotRange[1]
	);

	const setBackSubslot = useCallback(
		val => stateDispatch({target: 'backSubslot', value: val}),
		[stateDispatch]
	);

	const moveSlot = useCallback(
		delta => {
			setSearchString('');	
			const currentPos = glob.partSlots.indexOf(previewSlot);
			const maxPos = glob.partSlots.length - 1;			
			const hasTankLegs = acParts.legs['LegType'] === 'Tank';
			const [newPos, newRange] = shiftPos(currentPos, slotRange, delta, maxPos, 
				hasTankLegs, backSubslot, setBackSubslot);
			setSlotRange(newRange);
			stateDispatch({target: 'preview', slot: glob.partSlots[newPos]});
		},
		[acParts, previewSlot, backSubslot, slotRange, setBackSubslot, 
			setSearchString, stateDispatch]
	);

	const handleKeyDown = useCallback(
		(event) => {
			if(event.target.matches('input') || modal)
				return
			if(['q', 'Q'].includes(event.key))
				moveSlot(-1);
			else if(['e', 'E'].includes(event.key))
				moveSlot(1);
		},
		[modal, moveSlot]
	);

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[handleKeyDown]
	);

	const updateSlot = (s) => {
		stateDispatch({target: 'preview', slot: s});
		setSearchString('');
		if(['leftBack', 'rightBack'].includes(s)) {
			setBackSubslot(0)
		}
	}

	return (
		<>
		<div style={{width: '100%'}}>
			<button 
				style={{display: 'inline-block', width: '20%', marginRight: '10%'}}
				onClick={() => moveSlot(-1)}
			>
				{'< (Q)'}
			</button>
			<div style={{display: 'inline-block', textAlign: 'center', width: '40%', 
				marginBottom: '12px'}}>
				{glob.toDisplayString(previewSlot).toUpperCase()}
			</div>
			<button 
				style={{display: 'inline-block', width: '20%', marginLeft: '10%'}}
				onClick={() => moveSlot(1)}
			>
				{'(E) >'}
			</button>
		</div>
		<div>
		{
				displayedPartSlots.map(
				(s) => <SlotBox 
					slot = {s}
					inactive = {s === 'booster' && acParts.legs['LegType'] === 'Tank'}
					selected = {s === previewSlot}
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

const PartNameDisplay = ({name}) => {
	return (
		<div style={{display: 'flex', height: '100%', width: '100%'}}>
			<div style={{margin: 'auto'}}>{name}</div>
		</div>
	)
}

const EquippedTag = ({imgH, background}) => {
	const size = 40;
	const shift = imgH - size;
	return <div 
		style={{
			display: 'block',
			height: size, width: size,
			position: 'absolute', bottom: shift,
			backgroundImage: '-webkit-linear-gradient(' +
				'-45deg,' +
				background + '50%,' +
				'transparent 50%' +
			')'
		}}
	>
		EQ
	</div>
}

const PartBox = ({part, highlighted, setHighlightedId}) => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	const previewSlot = state.preview.slot;
	const acParts = state.parts;		
	const curPart = acParts[previewSlot];

	const background = highlighted ? glob.paletteColor(4, 1, 1.6) : glob.paletteColor(4);

	const img = glob.partImages[glob.toImageFileName(part.Name)];

	const updatePreview = () => {
		if(part['ID'] !== curPart['ID']) {
			stateDispatch({target: 'preview', part: part})
		} else {
			stateDispatch({target: 'preview', part: null})
		}
	}
	const updateAssembly = () => {
		stateDispatch({target: 'parts', slot: previewSlot, id: part['ID']})				
	}

	const [imgW, imgAspectRatio] = [220, 0.51];
	const imgH = Math.round(imgW * imgAspectRatio);

	const pairedPart = acParts[glob.pairedUnitSlots[previewSlot]];

	return (
		<div 
			style = {{margin: '5px auto', position: 'relative', height: imgH, width: imgW,
				cursor: 'pointer'}}
			onMouseEnter = {() => {setHighlightedId(part['ID']); updatePreview();}}
			onClick = {updateAssembly}
		>
			<div style={{width: '100%', height: '100%', background: background}}>
				{
					img === undefined ?
						<PartNameDisplay name={part['Name']} /> :
						<img src={img} alt={part['Name']} width={imgW} style={{display: 'block'}} />
				}
			</div>
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

const SortModal = ({closeModal, keys, slot}) => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	const previewSlot = state.preview.slot;
	const sortBy = state.sortBy;

	const [highlightedKey, setHighlightedKey] = useState(keys[0]);
	const [selectedKey, setSelectedKey] = useState(sortBy[previewSlot].key);

	const getBrightness = key => {
		if(key === selectedKey)
			return 2.5;
		if(key === highlightedKey)
			return 1.6;
		return 1.3
	}

	const onClick = (key) => {
		setSelectedKey(key);
		if(sortBy[previewSlot].key !== key)
			stateDispatch({target: 'sortBy', slot: previewSlot, value: {key: key, ascend: true}});
		else 
			stateDispatch({target: 'sortBy', slot: previewSlot, value: 
				{key: key, ascend: !sortBy[previewSlot].ascend}});
	}

	return(
		<>
		<div style={{width: 'fit-content', margin: '0px auto 5px auto'}}>
			Select sorting order
		</div>
		<div className="my-scrollbar" 
			style={{width: '350px', maxHeight: '600px', overflowY: 'auto', marginBottom: '5px'}}
		>
		{keys.map(
				(key) => <div 
					onMouseEnter={() => setHighlightedKey(key)}
					onClick={() => onClick(key)}
					style={{
						background: glob.paletteColor(4, 1, getBrightness(key)),
						textAlign: 'center', 
						width: '90%', padding: '5px 0', margin: '5px auto',
						cursor: 'pointer', position: 'relative'
					}}
					key={key}
				>			
					{glob.toDisplayString(key)}
					{
						key === selectedKey ?
							<img 
								src={
									sortBy[previewSlot].ascend ? 
										glob.sortIcons.ascend :
										glob.sortIcons.descend
									}
								alt={sortBy[previewSlot].ascend ? 'ascend' : 'descend'}
								width='25px'
								style={{display: 'block', filter: 'invert(1)', position: 'absolute', 
									bottom: '3px', left: '285px'}} 
							/> :
							<></>
					}
				</div>
			)
		}
		</div>
		<button
			style={{display: 'block', width: 'fit-content', margin: '10px auto'}}
			onClick={closeModal}
		>
			BACK (ESC)
		</button>
		</>
	)
}

function searchFilter(parts, searchString) {
	if(searchString === '')
		return parts;

	const query = searchString.toLowerCase();
	let output = parts.filter(
		part => part['Name'].toLowerCase().includes(query) || 
			part['Description']?.toLowerCase().includes(query)
	);

	return output;
}

function computeSortingKeys(slot, backSubslot) {
	const partsForSlot = glob.getPartsForSlot(slot, backSubslot);
	const allStats = partsForSlot.map(p => Object.keys(p)).flat();
	let sortingKeys = [...new Set(allStats)].filter(
		stat => !glob.hidddenPartStats.includes(stat)
	).sort();
	sortingKeys.unshift('Name');
	return sortingKeys;	
}

let partSortingKeys = {};
glob.partSlots.map(
	(slot) => {
		if(!['leftBack', 'rightBack'].includes(slot))
			partSortingKeys[slot] = computeSortingKeys(slot, 0); // 2nd arg is irrelevant
		else // This looks like shit
			partSortingKeys[slot] = {0: computeSortingKeys(slot, 0), 1: 
				computeSortingKeys(slot, 1)}
		return null;
	}
)

function getSortingKeys(slot, backSubslot) {
	if(!['leftBack', 'rightBack'].includes(slot))
		return partSortingKeys[slot];
	else
		return partSortingKeys[slot][backSubslot];
}

const PartSelector = ({searchString, onSearch, modal, setModal}) => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	const previewSlot = state.preview.slot;
	const backSubslot = state.backSubslot;
	const sortBy = state.sortBy;
	const showSearchTooltip = state.showTooltip;

	const [highlightedId, setHighlightedId] = useState(-1);

	const setShowSearchTooltip = val => stateDispatch({target: 'showTooltip', value: val});

	const partsForSlot = glob.getPartsForSlot(previewSlot, backSubslot);
	const sortingKeys = getSortingKeys(previewSlot, backSubslot);

	const nonePart = partsForSlot.find(part => part['Name'] === '(NOTHING)');
	let displayedParts = searchFilter(partsForSlot, searchString);

	// This sorting happens everytime a part is hovered on, because it changes preview.part
	// and this component depends on preview.slot. Separating the part and slot states should
	// prevent the sorting from happening every time because this component and this entire file
	// would not depend on the preview part state.
	displayedParts.sort(
		(a, b) => glob.partSortingFunction(sortBy[previewSlot].key, sortBy[previewSlot].ascend, a, b)
	)

	// If none part was there before search filter ensure it's still there and put it at
	// the top
	if(nonePart !== undefined) {
		displayedParts = displayedParts.filter(part => part['Name'] !== '(NOTHING)');
		displayedParts.unshift(nonePart);
	}	

	const closeModal = () => setModal(false);

	const handleKeyDown = useCallback(
		(event) => {
			if(event.target.matches('input') || modal)
				return
			if(['x', 'X'].includes(event.key)) 
				setModal(true);
		},
		[modal, setModal]
	);

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[handleKeyDown]
	);

	return(
		<>
		<div className="my-scrollbar" style={{height: '580px', overflowY: 'auto'}}>
		{
			displayedParts.map(
				(part) => <PartBox
					part = {part}
					highlighted = {part['ID'] === highlightedId}
					setHighlightedId = {setHighlightedId}
					key = {part['ID']}
				/>
			)
		}
		</div>
		<div style={{width: '90%', margin: '5px auto 0px auto'}}>
			<div style={{display: 'inline-block', width: '25%'}}>FILTER:</div>
			<input
				className='search-tooltip-anchor'
				data-tooltip-delay-show={100}
				style={{
					height: '25px',
					width: '75%',
					margin: '5px 0px 5px 0px',
					textTransform: 'uppercase',
					backgroundColor: glob.paletteColor(3)
				}}
				value={searchString}
				onChange={onSearch}

			/>
		</div>
		<ClosableTooltip
			text='Searches both among part names (e.g. BASHO) and unit descriptions (e.g. HANDGUN)'
			place='right'
			anchor='search-tooltip-anchor'
			show={showSearchTooltip}
			setShow={setShowSearchTooltip}
		/>
		<div 
			style={{position: 'relative', textAlign: 'center', padding: '5px 0px',
				margin: '5px auto 10px auto', backgroundColor: glob.paletteColor(3), width: '90%'}}
		>
			{glob.toDisplayString(sortBy[previewSlot].key)}
			<img 
				src={sortBy[previewSlot].ascend ? glob.sortIcons.ascend : glob.sortIcons.descend}
				alt={sortBy[previewSlot].ascend ? 'ascend' : 'descend'}
				width='25px'
				style={{display: 'block', filter: 'invert(1)', position: 'absolute', 
					bottom: '3px', left: '235px'}} 
			/>
		</div>
		<button 
			style={{display: 'block', width: 'fit-content', margin: '0px auto'}}
			onClick={() => setModal(true)}
		>
			SORT (X)
		</button>
		<ModalWrapper isOpen={modal} closeModal={closeModal}>
			{
				modal ? 
				<SortModal closeModal={closeModal} keys={sortingKeys} /> :
				<></>
			}
		</ModalWrapper>
		</>
	);
}

/*****************************************************************************/

const PartsExplorer = () => {

	const stateDispatch = useContext(BuilderStateDispatchContext);

	const [searchString, setSearchString] = useState('');
	const [modal, setModal] = useState(false);

	const closeExplorer = useCallback(
		() => {stateDispatch({target: 'preview', slot: null})},
		[stateDispatch]
	);

	const handleKeyDown = useCallback(
		(event) => {
			if(event.target.matches('input') || modal)
				return
			if(event.key === 'Escape') {
				closeExplorer()
			}
		},
		[modal, closeExplorer]
	)

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[handleKeyDown]
	);

	return (
		<>
		<button 
			style={{display: 'block', height: '35px', width: '150px', 
				border: '2px solid ' + glob.paletteColor(5)}}
			onClick={() => closeExplorer()}
		>
			BACK (ESC)
		</button>		
		<div style={
			{
				...{height: '785px', padding: '10px 5px'},
				...glob.dottedBackgroundStyle()
			}
		}>
			<SlotSelector
				setSearchString={setSearchString}
				modal={modal}
			/>
			<PartSelector
				searchString = {searchString}
				modal = {modal}
				setModal = {setModal}
				onSearch = {event => setSearchString(event.target.value)}
			/>
		</div>
		</>
	)
}

export default PartsExplorer;