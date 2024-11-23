import { useReducer, createContext } from 'react';

import { useSearchParams } from 'react-router-dom'

import * as glob from '../Misc/Globals.js';
import {getInitialBuild} from '../Misc/BuildImportExport.js'

export const ACPartsContext = createContext(null);
export const ACPartsDispatchContext = createContext(null);

/***************************************************************************************/

const assemblyPartsReducer = (parts, action) => {

	const newParts = {...parts};
	const newPart = glob.partsData[action.id];
	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	if(newPart['ID'] !== glob.noneUnit['ID']) {
		Object.entries(glob.pairedUnitSlots).forEach(([slot1, slot2]) => {
			if(action.slot === slot1 && parts[slot2]['ID'] === newPart['ID']) {
				const slotDisplayString = glob.splitCamelCase(slot2).toLowerCase();
				glob.notify('Unit removed from ' + slotDisplayString + ' slot');
				newParts[slot2] = glob.noneUnit;
			}
		})
	}
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank') {
			if(parts.booster['ID'] !== glob.noneBooster['ID']) {
				newParts.booster = glob.noneBooster;
				glob.notify('Booster removed');
			}
		} else if(newPart['LegType'] !== 'Tank') {
			if(parts.booster['ID'] === glob.noneBooster['ID']) {
				newParts.booster = glob.defaultBooster;
				glob.notify('Random booster added');
			}
		}
	}
	newParts[action.slot] = newPart;

	return newParts
}

/***************************************************************************************/

export const ACPartsProvider = ({children}) => {
	const [searchParams] = useSearchParams();

	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		null,
		() => getInitialBuild(searchParams.get('build'))
	);

	return (
		 <ACPartsContext.Provider value={acParts}>
			<ACPartsDispatchContext.Provider value={acPartsDispatch}>
				{children}
			</ACPartsDispatchContext.Provider>
		</ACPartsContext.Provider>
	);
}
