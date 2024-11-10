import { useState, useReducer, useEffect } from 'react';

import {globPartsData, globNoneUnit, globNoneBooster, globPartSlots} from './Misc/Globals.js';
import ACAssembly from "./Components/ACAssembly.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import PartStats from "./Components/PartStats.jsx";
import ACStats from "./Components/ACStats.jsx";

import './reset.css'

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
			globPartSlots[pos],
			globPartsData.find(
				part => part.Kind === assemblyKinds[pos] && part.Name === name
			)
		]
	)
)

/*************************************************************************************/

const checkedUnitSlots = [['rightArm', 'rightBack'], ['rightBack', 'rightArm'], 
	['leftArm', 'leftBack'], ['leftBack', 'leftArm']];

const assemblyPartsReducer = (parts, action) => {
	const output = {...parts};
	if(action.setNull) {
		output[action.target] = null;
		return output;
	}

	let newPartList = {...parts.current};
	const newPart = globPartsData[action.id];
	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	checkedUnitSlots.forEach(([slot1, slot2]) => {
		if(action.slot === slot1 && parts.current[slot2]['ID'] === newPart)
			newPartList[slot2] = globNoneUnit;
		// TODO: emit a message here and for the tank/booster business
	})
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(
			newPart['LegType'] === 'Tank' &&
			parts.current.booster['ID'] != globNoneBooster['ID']
		) {
			newPartList.booster = globNoneBooster;
		} else if(
			newPart['LegType'] != 'Tank' && 
			parts.current.booster['ID'] === globNoneBooster['ID']
		) {
			newPartList.booster = globPartsData.find((part) => part['Kind'] === 'Booster');
		}
	}
	newPartList[action.slot] = newPart;

	output[action.target] = newPartList;

	return output
}

const previewReducer = (preview, action) => {
	if(action.slot !== undefined)
		return {slot: action.slot, part: null}
	else // set part
		return {slot: preview.slot, part: action.part}
}

function App() {
	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		{current: starterACParts, preview: null}
	);
	const [preview, previewDispatch] = useReducer(
		previewReducer,
		{slot: null, part: null}
	)

	const handleKeyDown = (event) => {
		if(event.key == 'Escape')
			previewDispatch({slot: null})
	}

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		},
		[]
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
				circle at center,\
				rgb(36, 53, 73),\
				rgb(13, 20, 30)\
			)'
	}
	const containerStyle = {
		display : 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center'
	}

	return (
		<div style={backgroundStyle}>
		<div style={containerStyle}>
			{
				preview.slot === null ?
					<ACAssembly 
						currentParts={acParts.current}
						previewSetter={slot => previewDispatch({slot: slot})}
					/> :
					<PartsExplorer 
						preview={preview}
						previewDispatch={previewDispatch}
						acParts={acParts.current}
						acPartsDispatch={acPartsDispatch}
					/>
			}
			<PartStats 
				previewPart={preview.part}
				curPart={acParts.current[preview.slot]}
			/>			
			<ACStats acParts={acParts}/>
		</div>
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>