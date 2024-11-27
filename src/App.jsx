import { useState, useReducer } from 'react';

import * as glob from './Misc/Globals.js';
import ACAssembly from "./Components/ACAssembly.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import PartStats from "./Components/PartStats.jsx";
import ACStats from "./Components/ACStats.jsx";
import ModalWrapper from './Components/ModalWrapper.jsx'

/*************************************************************************************/

const AboutModal = ({closeModal}) => {
	return(
		<div style={{textAlign: 'justify'}}>
		<p>
			AC6 Advanced Garage is a tool to create, analyze and optimize builds for the game 
			Armored Core VI. It aims at replicating the look and feel of the in-game builder 
			while also providing other features, including useful additional stats that are not 
			shown in the game. An info icon next to these stats displays a tooltip that explains
			their meaning.
		</p>
		<p>&nbsp;</p>
			For more information about how stats are computed, the source code is on&nbsp;
			<a href="https://github.com/matteosal/ac6-advanced-garage" target="_blank"
				rel="noreferrer">
				GitHub
			</a>. Feel free reach out to report issues or if willing to contribute.
		<p>&nbsp;</p>
		<p>
			This is purely a passion project that I developed for fun and I intend to distribute
			freely, I will never make any money from it.
		</p>
		<p>&nbsp;</p>
		<ul style={{paddingLeft: '20px'}}>
			<li>
				Game-related images taken from the&nbsp;
					<a href="https://armoredcore.fandom.com/" target="_blank"
						rel="noreferrer">
						game wiki
					</a> with added color balancing and from in-game screenshots.
			</li>
			<li>
				Mechanic icons created by&nbsp;
				<a href="https://www.flaticon.com/free-icons/mechanic" target="_blank"
					rel="noreferrer">
				 Good Ware - Flaticon
				 </a>
			</li>
			<li>
				Sorting order icons created by&nbsp;
				<a href="https://www.flaticon.com/free-icons/sort-ascending" target="_blank"
					rel="noreferrer">
					Icon Hubs - Flaticon
				</a>			
			</li>
			<li>
				Information icon from &nbsp;
				<a href="https://icons8.com/" target="_blank" rel="noreferrer">
					icons8
				</a>			
			</li>
		</ul>
		<button 
			style={{display: 'block', width: 'fit-content', margin: '10px auto'}}
			onClick={closeModal}
		>
			BACK (ESC)
		</button>
		</div>
	)
}

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
	const [modal, setModal] = useState(false);

	const closeModal = () => setModal(false);

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
	const backgroundTextStyle = {width: 'fit-content',
		margin: 'auto',
		fontSize: '80px',
		textAlign: 'center',
		color: '#eee',
		fontFamily: 'Operation-Napalm, serif',
		fontWeight: 1000,
		textShadow: '2px 2px 0px #666, 5px 7px 8px black'
	}

	return (
		<div style={backgroundStyle}>
		<div style={containerStyle}>
			<div style={
				{display: 'inline-block', width: '65%', marginTop: '30px', verticalAlign: 'top'}
			}>
			{
				preview.slot === null ?
					<>
					<div style={{display:'inline-block', width: '35%', marginTop: '70px'}}>
						<ACAssembly previewSetter={slot => previewDispatch({slot: slot})}/>
					</div>
					<div style={{display:'inline-block', width: '65%'}}>
						<div style={backgroundTextStyle}>ARMORED CORE VI</div>
						<div style={
								{...backgroundTextStyle, fontSize: '45px', paddingBottom: '325px'}
						}>
							ADVANCED GARAGE
						</div>
						<button 
							style={{display: 'block', margin: 'auto'}}
							onClick={() => setModal(true)}
						>
							ABOUT/INFO
						</button>
					</div>
					<ModalWrapper isOpen={modal} closeModal={closeModal}>
						{
							modal ? 
							<AboutModal closeModal={closeModal} /> :
							<></>
						}
					</ModalWrapper>					
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
				{display: 'inline-block', width: '35%', marginTop: '70px', verticalAlign: 'top'}
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
