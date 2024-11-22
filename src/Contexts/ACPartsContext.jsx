import { useReducer, createContext } from 'react';

import { useSearchParams } from 'react-router-dom'

import * as glob from '../Misc/Globals.js';
import {getInitialBuild} from '../Misc/BuildImportExport.js'

export const ACPartsContext = createContext(null);
export const ACPartsDispatchContext = createContext(null);

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
					glob.notify('Unit removed from ' + slotDisplayString + ' slot');
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
					glob.notify('Booster removed');
			}
		} else if(newPart['LegType'] != 'Tank') {
			if(parts.current.booster['ID'] === glob.noneBooster['ID']) {
				newPartList.booster = glob.partsData.find((part) => part['Kind'] === 'Booster');
				if(action.target === 'current')
					glob.notify('Random booster added');
			}
		}
	}
	newPartList[action.slot] = newPart;

	output[action.target] = newPartList;

	return output
}

/***************************************************************************************/

export const ACPartsProvider = ({children}) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		null,
		() => {
			return {current: getInitialBuild(searchParams.get('build')), preview: null}
		}
	);

	return (
		 <ACPartsContext.Provider value={acParts}>
			<ACPartsDispatchContext.Provider value={acPartsDispatch}>
				{children}
			</ACPartsDispatchContext.Provider>
		</ACPartsContext.Provider>
	);
}
