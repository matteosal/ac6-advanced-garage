import { useState, useReducer } from 'react'

import {globPartsData, globNoneUnit, globNoneBooster, globPartSlots} from './Misc/Globals.js'
import AssemblyDisplay from "./Components/AssemblyDisplay.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import StatsDisplay from "./Components/StatsDisplay.jsx";

/*************************************************************************************/

const starterACPartNames = [
	'RF-024 TURNER',
	'HI-32: BU-TT/A',
	'BML-G1/P20MLT-04',
	'None',
	'HC-2000 FINDER EYE',
	'CC-2000 ORBITER',
	'AC-2000 TOOL ARM',
	'2C-2000 CRAWLER',
	'BST-G1/P10',
	'FCS-G1/P01',
	'AG-J-098 JOSO',
	'None'
]
const assemblyKinds = ['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Legs',
	'Booster', 'FCS', 'Generator', 'Expansion']
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
	['leftArm', 'leftShoulder'], ['leftShoulder', 'leftArm']]

const assemblyPartsReducer = (parts, action, forcedSource) => {
	// When this is called by previewAssemblyPartsDispatch we want to create a new preview
	// from the current state of the non-preview assembly parts, which are passed in
	// forcedSource
	// When it's called from assemblyPartsDispatch we still want to use the non-assembly
	// parts as source but those are available in the first argument parts so we pass null
	// as forcedSource
	if(forcedSource === null)
		var source = parts
	else
		var source = forcedSource
	let newParts = {...source}

	const newPart = globPartsData[action.id]
	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	checkedUnitSlots.forEach(([slot1, slot2]) => {
		if(action.slot === slot1 && source[slot2]['ID'] === newPart)
			newParts[slot2] = globNoneUnit
	})
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank' && source.booster != globNoneBooster) {
			newParts.booster = globNoneBooster
		} else if(newPart['LegType'] != 'Tank' && source.booster === globNoneBooster) {
			newParts.booster = globPartsData.find((part) => part['Kind'] === 'Booster')
		}
	}

	newParts[action.slot] = newPart

	return newParts
}

function App() {
	const [assemblyParts, assemblyPartsDispatch] = useReducer(
		(parts, action) => assemblyPartsReducer(parts, action, null),
		starterACParts
	)
	const [previewAssemblyParts, previewAssemblyPartsDispatch] = useReducer(
		(parts, action) => assemblyPartsReducer(parts, action, assemblyParts),
		null
	)
	const [explorerSlot, setExplorerSlot] = useState(null)

	return (
		<div>
			{
				explorerSlot === null ? 
					<AssemblyDisplay parts={assemblyParts} setExplorerSlot={setExplorerSlot} /> : 
					<PartsExplorer 
						slot={explorerSlot}
						setSlot={setExplorerSlot}
						assemblyParts={assemblyParts}
						assemblyPartsDispatch={assemblyPartsDispatch}
						previewAssemblyPartsDispatch={previewAssemblyPartsDispatch}
					/>
			}
			<StatsDisplay assemblyParts={assemblyParts} previewAssemblyParts={previewAssemblyParts}/>
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>