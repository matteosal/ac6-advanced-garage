import { useReducer, createContext } from 'react';

import { toast, Slide } from 'react-toastify';

import * as glob from '../Misc/Globals.js';
export const ACPartsContext = createContext(null);
export const ACPartsDispatchContext = createContext(null);

/***************************************************************************************/

function notify(msg) {
	return toast(msg, 
		{style: {background: glob.paletteColor(0)}, type:'info', position: "top-right", 
			autoClose: 3000, transition: Slide}
	)
}

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
);

/***************************************************************************************/

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
	if(newPart['ID'] !== glob.noneUnit['ID']) {
		Object.entries(glob.pairedUnitSlots).forEach(([slot1, slot2]) => {
			if(action.slot === slot1 && parts.current[slot2]['ID'] === newPart['ID']) {
				if(action.target === 'current') {
					const slotDisplayString = glob.splitCamelCase(slot2).toLowerCase();
					notify('Unit removed from ' + slotDisplayString + ' slot');
				}
				newPartList[slot2] = glob.noneUnit;
			}
		})
	}
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank') {
			if(parts.current.booster['ID'] != glob.noneBooster['ID']) {
				newPartList.booster = glob.noneBooster;
				if(action.target === 'current')
					notify('Booster removed');
			}
		} else if(newPart['LegType'] != 'Tank') {
			if(parts.current.booster['ID'] === glob.noneBooster['ID']) {
				newPartList.booster = glob.partsData.find((part) => part['Kind'] === 'Booster');
				if(action.target === 'current')
					notify('Random booster added');
			}
		}
	}
	newPartList[action.slot] = newPart;

	output[action.target] = newPartList;

	return output
}

/***************************************************************************************/

export const ACPartsProvider = ({children}) => {
	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		{current: starterACParts, preview: null}
	);

	return (
		 <ACPartsContext.Provider value={acParts}>
			<ACPartsDispatchContext.Provider value={acPartsDispatch}>
				{children}
			</ACPartsDispatchContext.Provider>
		</ACPartsContext.Provider>
	);
}
