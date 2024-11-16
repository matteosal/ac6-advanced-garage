import { useState, useReducer, useEffect } from 'react';

import { toast, Slide } from 'react-toastify';



import * as glob from './Misc/Globals.js';
import ACAssembly from "./Components/ACAssembly.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import PartStats from "./Components/PartStats.jsx";
import ACStats from "./Components/ACStats.jsx";

/*************************************************************************************/

const starterACPartNames = [
	'RF-024 TURNER',
	'HI-32: BU-TT/A',
	'BML-G1/P20MLT-04',
	'(NOTHING)',
	'HC-2000 FINDER EYE',
	'CC-2000 ORBITER',
	'AC-2000 TOOL ARM',
	'2C-2000 CRAWLER',
	'BST-G1/P10',
	'FCS-G1/P01',
	'AG-J-098 JOSO',
	'(NOTHING)'
];
const assemblyKinds = ['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Legs',
	'Booster', 'FCS', 'Generator', 'Expansion'];
const starterACParts = Object.fromEntries(
	starterACPartNames.map(
		(name, pos) => [
			glob.partSlots[pos],
			glob.partsData.find(
				part => part.Kind === assemblyKinds[pos] && part.Name === name
			)
		]
	)
)

/*************************************************************************************/

const checkedUnitSlots = [['rightArm', 'rightBack'], ['rightBack', 'rightArm'], 
	['leftArm', 'leftBack'], ['leftBack', 'leftArm']];

let hasTankLegs = false;

function notify(msg) {
	return toast(msg, 
		{style: {background: glob.paletteColor(0)}, type:'info', position: "top-right", 
			autoClose: 3000, transition: Slide}
	)
}

const assemblyPartsReducer = (parts, action) => {
	const output = {...parts};
	if(action.setNull) {
		output[action.target] = null;
		return output;
	}

	let newPartList = {...parts.current};
	const newPart = glob.partsData[action.id];
	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	checkedUnitSlots.forEach(([slot1, slot2]) => {
		if(action.slot === slot1 && parts.current[slot2]['ID'] === newPart)
			newPartList[slot2] = glob.noneUnit;
	})
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank') {
			if(parts.current.booster['ID'] != glob.noneBooster['ID'])
				newPartList.booster = glob.noneBooster;
			if(action.target === 'current'){
				notify('Booster removed');
				hasTankLegs = true;
			}
		} else if(newPart['LegType'] != 'Tank') {
			if(parts.current.booster['ID'] === glob.noneBooster['ID'])
				newPartList.booster = glob.partsData.find((part) => part['Kind'] === 'Booster');
			if(action.target === 'current'){
				notify('Random booster added');
				hasTankLegs = false;
			}
		}
	}
	newPartList[action.slot] = newPart;

	output[action.target] = newPartList;

	return output
}

const previewReducer = (preview, action) => {
	if(action.slot === null) {
		// Set slot to null means close the part explorer. Reached by keydown handler (ESC)
		return {slot: null, slotRange: null, part: null}
	} else if(action.slot !== undefined) { 
		// Set slot without shifting slotRange
		if(preview.slotRange === null) { 
			// PartsExplorer is closed, reached by ACAssembly. We have to calculate slotRange
			const pos = glob.partSlots.indexOf(action.slot);
			const start = Math.min(Math.max(pos - 1, 0), glob.partSlots.length - 5);
			return {slot: action.slot, slotRange: [start, start + 4], part: null}
		} else{
			// PartsExplorer is open, reached by SlotBox. Keep slot range and just change slot
			return {slot: action.slot, slotRange: preview.slotRange, part: null}
		}
	} else if(action.moveSlot !== undefined) { 
		// Set slot shifting slotRange if possible. Reached by keydown handler (Q|E) when 
		// PartsExplorer is open
		const currentPos = glob.partSlots.indexOf(preview.slot);
		const maxPos = glob.partSlots.length - 1;
		let newRange = preview.slotRange;
		let newPos;
		if(action.moveSlot === 1 && currentPos < maxPos) { 
			// Increase slot id, shift right if possible
			newPos = currentPos + 1;
			if(newPos === 8 && hasTankLegs)
				newPos = 9;
			const newSlot = glob.partSlots[newPos];
			if(newPos > preview.slotRange[1] - 1 && preview.slotRange[1] < maxPos)
				newRange = newRange.map(i => i+1);
			return {slot: newSlot, slotRange: newRange, part: null}
		} else if(action.moveSlot === -1 && currentPos > 0) { 
			// Decrease slot id, shift left if possible
			newPos = currentPos - 1;
			if(newPos === 8 && hasTankLegs)
				newPos = 7;
			const newSlot = glob.partSlots[newPos];
			if(newPos < preview.slotRange[0] + 1 && preview.slotRange[0] > 0)
				newRange = newRange.map(i => i-1);
			return {slot: newSlot, slotRange: newRange, part: null}
		} else { 
			// Already at limit, cannot increase|decrease
			return preview
		}
	}
	else // Set part without changing slot
		return {slot: preview.slot, slotRange: preview.slotRange, part: action.part}
}

function App() {
	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		{current: starterACParts, preview: null}
	);
	const [preview, previewDispatch] = useReducer(
		previewReducer,
		{slot: null, slotRange: null, part: null}
	)

	const handleKeyDown = (event) => {
		if(event.target.matches('input'))
			return
		if(event.key === 'Escape') {
			previewDispatch({slot: null})
			acPartsDispatch({target: 'preview', setNull: true})
		}
		else if(preview.slot !== null && event.key === 'e')
			previewDispatch({moveSlot: 1})
		else if(preview.slot !== null && event.key === 'q')
			previewDispatch({moveSlot: -1})
	}

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[handleKeyDown]
	);

	const backgroundStyle = {
		height: '100vh',
		width: '100vw',		
		background: 
			'repeating-linear-gradient(\
				rgb(0, 0, 0, 0) 0px,\
				rgb(0, 0, 0, 0) 3px,\
				rgb(127, 127, 127, 0.05) 3px,\
				rgb(127, 127, 127, 0.05) 6px\
			), \
			radial-gradient(\
				circle at center,'
				+ glob.paletteColor(1) + ','
				+ glob.paletteColor(0) + 
			')'
	};
	const containerStyle = {
		height: '100%',
		width: '1550px',
		margin: 'auto'
	};
	const inlineBlockStyle = {
		display: 'inline-block',
		width: '500px',
		marginTop: '50px'
	};

	return (
		<div style={backgroundStyle}>
		<div style={containerStyle}>
			<div style={
				{display: 'inline-block', width: '65%', marginTop: '50px', verticalAlign: 'top'}
			}>
			{
				preview.slot === null ?
					<>
					<div style={{width: '35%', marginTop: '125px'}}>
						<ACAssembly 
							currentParts={acParts.current}
							previewSetter={slot => previewDispatch({slot: slot})}
						/>
					</div>
					</>:
					<>
					<div style={
						{display: 'inline-block', width: '30%', verticalAlign: 'top', marginTop: '50px'}
					}>
						<PartsExplorer 
							preview={preview}
							previewDispatch={previewDispatch}
							acParts={acParts.current}
							acPartsDispatch={acPartsDispatch}
						/>
					</div>
					<div style={
						{display: 'inline-block', width: '65%', verticalAlign: 'top', 
							marginLeft: '2.5%', marginRight: '2.5%', marginTop: '50px'}
					}>
						<PartStats 
							previewPart={preview.part}
							curPart={acParts.current[preview.slot]}
						/>
					</div>
					</>
			}
			</div>
			<div style={
				{display: 'inline-block', width: '35%', marginTop: '100px', verticalAlign: 'top'}
			}>
				<ACStats acParts={acParts}/>
			</div>
		</div>
		</div>
	);
}

export default App;
