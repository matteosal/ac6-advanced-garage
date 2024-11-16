import { useState, useReducer, useEffect, useContext } from 'react';

import * as glob from './Misc/Globals.js';
import {ACPartsProvider} from "./Contexts/ACPartsContext.jsx";
import ACAssembly from "./Components/ACAssembly.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import PartStats from "./Components/PartStats.jsx";
import ACStats from "./Components/ACStats.jsx";

/*************************************************************************************/

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
		const hasTankLegs = action.hasTankLegs || false;
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
	const [preview, previewDispatch] = useReducer(
		previewReducer,
		{slot: null, slotRange: null, part: null}
	)

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
		<ACPartsProvider>
			<div style={
				{display: 'inline-block', width: '65%', marginTop: '50px', verticalAlign: 'top'}
			}>
			{
				preview.slot === null ?
					<>
					<div style={{width: '35%', marginTop: '125px'}}>
						<ACAssembly 
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
						/>
					</div>
					<div style={
						{display: 'inline-block', width: '65%', verticalAlign: 'top', 
							marginLeft: '2.5%', marginRight: '2.5%', marginTop: '50px'}
					}>
						<PartStats 
							preview={preview}
						/>
					</div>
					</>
			}
			</div>
			<div style={
				{display: 'inline-block', width: '35%', marginTop: '100px', verticalAlign: 'top'}
			}>
				<ACStats/>
			</div>
		</ACPartsProvider>
		</div>
		</div>
	);
}

export default App;
