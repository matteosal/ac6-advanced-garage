import { useState } from 'react';

import * as glob from '../Misc/Globals.js';

import ModalWrapper from './ModalWrapper.jsx'

const switcherButtonStyle = {
	margin: '0px 10px 0px 10px',
	padding: '10px'
}

const HelpModal = ({closeModal}) => {
	return(
		<div style={{textAlign: 'justify'}}>
		<ul style={{paddingLeft: '20px', paddingBottom: '10px'}}>
			<li style={{fontSize: '20px', fontWeight: 'bold'}}>BUILD SECTION</li>
		</ul>
		<p style={{paddingBottom: '15px'}}>
			Works pretty much the same as the in-game builder with the addition of a button to
			generate a build link and a search box to filter parts. The button produces a link to
			this site with the current build loaded as initial build, useful to share builds with
			others. The search box  searches both among part names (e.g. BASHO) and unit 
			descriptions (e.g. HANDGUN).
		</p>
		<ul style={{paddingLeft: '20px', paddingBottom: '10px'}}>
			<li style={{fontSize: '20px', fontWeight: 'bold'}}>COMPARE BUILDS SECTION</li>
		</ul>
		<p style={{paddingBottom: '15px'}}>
			Insert a build link (generated by the CREATE BUILD LINK button of the build section)
			in any of the input fields, then click LOAD or press enter to load the build in the 
			panel. Tick two of the COMPARE checkboxes at the bottom and click the SHOW SPECS 
			button to compare the builds.
		</p>
		<ul style={{paddingLeft: '20px', paddingBottom: '10px'}}>
			<li style={{fontSize: '20px', fontWeight: 'bold'}}>TABLES SECTION</li>
		</ul>
		<p style={{paddingBottom: '15px'}}>
			Contains tables with the specs for all the parts in the game. Clicking on
			any column sorts the parts by that column in ascending/descending order. Columns
			can be filtered using the associated button and can be moved by dragging the headers
			onto other columns. Unit parts can also be filtered according to their attributes.
		</p>
		<ul style={{paddingLeft: '20px', paddingBottom: '10px'}}>
			<li style={{fontSize: '20px', fontWeight: 'bold'}}>RICOCHET CALCULATOR SECTION</li>
		</ul>
		<p style={{paddingBottom: '15px'}}>
			Set the defending AC's defense values and choose a weapon from the dropdown. Energy/
			Kinetic weapons and defenses use different dashing in the graph. The intersection
			between the weapon's ricochet profile and the corresponding vertical defense line
			gives the displayed ricochet range.
		</p>
		<button
			style={{display: 'block', width: 'fit-content', margin: '10px auto'}}
			onClick={closeModal}
		>
			BACK (ESC)
		</button>
		</div>
	)
}

const SwitcherButton = ({name, selected, setter}) => {

	const isSelected = name === selected;
	let style = switcherButtonStyle;
	if(isSelected)
		style = {...style, background: glob.paletteColor(5), 
			border: '2px solid ' + glob.paletteColor(5, 1, 1.5)};

	return(
		<button style={style} onClick={() => setter(name)}>
			{name}
		</button>
	)
}

const MainSwitcher = ({selectedSwitch, setSelectedSwitch}) => {

	const [modal, setModal] = useState(false);

	const openModal = () => setModal(true);
	const closeModal = () => setModal(false);

	return(
		<>
		<div style={{position: 'relative'}}>
		<div style={
			{display: 'flex', justifyContent: 'center', paddingTop: '15px'}
		}>
			<SwitcherButton name={'BUILD'} selected={selectedSwitch} setter={setSelectedSwitch} />
			<SwitcherButton name={'COMPARE BUILDS'}
				selected={selectedSwitch} setter={setSelectedSwitch} />
			<SwitcherButton name={'TABLES'}
				selected={selectedSwitch} setter={setSelectedSwitch} />
			<SwitcherButton name={'RICOCHET CALCULATOR'}
				selected={selectedSwitch} setter={setSelectedSwitch} />
			<button 
				style={{...switcherButtonStyle, position: 'absolute', right: 0}}
				onClick={openModal}
			>
				INSTRUCTIONS
			</button>
		</div>
		</div>
		<ModalWrapper isOpen={modal} closeModal={closeModal}>
			{
				modal ? 
				<HelpModal closeModal={closeModal} /> :
				<></>
			}
		</ModalWrapper>
		</>
	)
}

export default MainSwitcher;