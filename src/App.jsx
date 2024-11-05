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

const assemblyPartsReducer = (parts, action) => {
	const newPart = globPartsData[action.id]
	let newParts = {...parts}

	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	checkedUnitSlots.forEach(([slot1, slot2]) => {
		if(action.slot === slot1 && parts[slot2]['ID'] === action.id)
			newParts[slot2] = globNoneUnit
	})
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank' && parts.booster != globNoneBooster) {
			newParts.booster = globNoneBooster
		} else if(newPart['LegType'] != 'Tank' && parts.booster === globNoneBooster) {
			newParts.booster = globPartsData.find((part) => part['Kind'] === 'Booster')
		}
	}

	newParts[action.slot] = newPart

	return newParts
}

function App() {
	const [assemblyParts, assemblyPartsDispatch] = useReducer(
		assemblyPartsReducer,
		starterACParts
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
					/>
			}
			<StatsDisplay assemblyParts={assemblyParts} />
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>