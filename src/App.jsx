import { useState, useReducer } from 'react';

import {globPartsData, globNoneUnit, globNoneBooster, globPartSlots} from './Misc/Globals.js';
import AssemblyDisplay from "./Components/AssemblyDisplay.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import StatsDisplay from "./Components/StatsDisplay.jsx";

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

const checkedUnitSlots = [['rightArm', 'rightShoulder'], ['rightShoulder', 'rightArm'], 
	['leftArm', 'leftShoulder'], ['leftShoulder', 'leftArm']];

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

function App() {
	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		{current: starterACParts, preview: null}
	);
	const [explorerSlot, setExplorerSlot] = useState(null);

	return (
		<div>
			{
				explorerSlot === null ? 
					<AssemblyDisplay 
						currentParts={acParts.current}
						setExplorerSlot={setExplorerSlot} 
					/> : 
					<PartsExplorer 
						slot={explorerSlot}
						setSlot={setExplorerSlot}
						acParts={acParts.current}
						acPartsDispatch={acPartsDispatch}
					/>
			}
			<StatsDisplay acParts={acParts}/>
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>