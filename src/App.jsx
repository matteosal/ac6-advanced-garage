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
		return {slot: null, part: null}
	} else if(action.slot !== undefined) { 
		return {slot: action.slot, part: null}
	} else // Set part without changing slot
		return {slot: preview.slot, part: action.part}
}

function App() {
	const [preview, previewDispatch] = useReducer(
		previewReducer,
		{slot: null, part: null}
	)

	const backgroundStyle = {
		width: '100vw',
		height: '100vh',
		minWidth: '1600px',
		minHeight: '900px',
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
						{display: 'inline-block', width: '30%', verticalAlign: 'top', 
							marginTop: '5px'}
					}>
						<PartsExplorer 
							preview={preview}
							previewDispatch={previewDispatch}
						/>
					</div>
					<div style={
						{display: 'inline-block', width: '65%', verticalAlign: 'top', 
							marginLeft: '2.5%', marginRight: '2.5%', marginTop: '40px'}
					}>
						<PartStats 
							preview={preview}
						/>
					</div>
					</>
			}
			</div>
			<div style={
				{display: 'inline-block', width: '35%', marginTop: '90px', verticalAlign: 'top'}
			}>
				<ACStats/>
			</div>
		</ACPartsProvider>
		</div>
		</div>
	);
}

export default App;
