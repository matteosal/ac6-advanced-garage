import { useState, useReducer } from 'react';

import * as glob from './Misc/Globals.js';
import MainSwitcher from './Components/MainSwitcher.jsx';
import Title from './Components/Title.jsx';
import ACAssembly from './Components/ACAssembly.jsx';
import PartsExplorer from './Components/PartsExplorer.jsx';
import PartStats from './Components/PartStats.jsx';
import ACStats from './Components/ACStats.jsx';

/*************************************************************************************/

const backgroundStyle = {
	width: '100vw',
	height: '100vh',
	minWidth: '1600px',
	minHeight: '900px',
	background: 
		'repeating-linear-gradient(' +
			'rgb(0, 0, 0, 0) 0px,' +
			'rgb(0, 0, 0, 0) 3px,' +
			'rgb(127, 127, 127, 0.05) 3px,' +
			'rgb(127, 127, 127, 0.05) 6px' +
		'),' +
		'radial-gradient(' +
			'circle at center,' +
			glob.paletteColor(1) + ',' +
			glob.paletteColor(0) + 
		')',
	position: 'relative'
};
const containerStyle = {
	height: '100%',
	width: '1550px',
	margin: 'auto'
};

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

	const [selectedSwitch, setSelectedSwitch] = useState('BUILD');

	return (
		<div style={backgroundStyle}>
		<div style={containerStyle}>
			<MainSwitcher selectedSwitch={selectedSwitch} setSelectedSwitch={setSelectedSwitch}/>
			<div style={
				{display: 'inline-block', width: '65%', verticalAlign: 'top'}
			}>
			{
				preview.slot === null ?
					<>
					<div style={{display:'inline-block', width: '35%', marginTop: '40px'}}>
						<ACAssembly previewSetter={slot => previewDispatch({slot: slot})}/>
					</div>
					<div style={{display:'inline-block', verticalAlign: 'top', width: '65%'}}>
						<Title />
					</div>				
					</> 
					:
					<>
					<div style={
						{display: 'inline-block', width: '30%', verticalAlign: 'top'}
					}>
						<PartsExplorer 
							preview={preview}
							previewDispatch={previewDispatch}
						/>
					</div>
					<div style={
						{display: 'inline-block', width: '65%', verticalAlign: 'top', 
							marginLeft: '2.5%', marginRight: '2.5%', marginTop: '35px'}
					}>
						<PartStats 
							preview={preview}
						/>
					</div>
					</>
			}
			</div>
			<div style={
				{display: 'inline-block', width: '35%', marginTop: '35px', verticalAlign: 'top'}
			}>
				<ACStats preview={preview}/>
			</div>
		</div>
		<div style={{color: 'gray', position: 'absolute', bottom: 15, left: 20}}>
			{'Version ' + process.env.REACT_APP_VERSION}
		</div>
		</div>
	);
}

export default App;
