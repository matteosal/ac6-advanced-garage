import { useReducer, createContext, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom'

import * as glob from '../Misc/Globals.js';
import {getInitialBuild} from '../Misc/BuildImportExport.js'

export const ACPartsContext = createContext(null);
export const ACPartsDispatchContext = createContext(null);

/***************************************************************************************/

const assemblyPartsReducer = (acParts, action) => {

	const newParts = {...acParts.parts};
	let newMsg = null;
	const newPart = glob.partsData[action.id];
	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	if(newPart['ID'] !== glob.noneUnit['ID']) {
		Object.entries(glob.pairedUnitSlots).forEach(([slot1, slot2]) => {
			if(action.slot === slot1 && acParts.parts[slot2]['ID'] === newPart['ID']) {
				const slotDisplayString = glob.splitCamelCase(slot2).toLowerCase();
				newMsg = 'Unit removed from ' + slotDisplayString + ' slot';
				newParts[slot2] = glob.noneUnit;
			}
		})
	}
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank') {
			if(acParts.parts.booster['ID'] !== glob.noneBooster['ID']) {
				newParts.booster = glob.noneBooster;
				newMsg = 'Booster removed';
			}
		} else if(newPart['LegType'] !== 'Tank') {
			if(acParts.parts.booster['ID'] === glob.noneBooster['ID']) {
				newParts.booster = glob.defaultBooster;
				newMsg = 'Booster \'' + glob.defaultBooster['Name'] + '\' added';
			}
		}
	}
	newParts[action.slot] = newPart;

	return {parts: newParts, msg: newMsg}
}

/***************************************************************************************/

export const ACPartsProvider = ({children}) => {
	const [searchParams] = useSearchParams();

	// We want the reducer to display toasts but we can't do it directly from there because
	// that triggers a rendering during rendering and react emits a warning. So we add the
	// error message to the state, we let the reducer set it and we check it later in the 
	// useEffect of this component
	const [acParts, acPartsDispatch] = useReducer(
		assemblyPartsReducer,
		null,
		() => {
			return {parts: getInitialBuild(searchParams.get('build')), msg: null}
		}
	);

	useEffect(() => 
		{
			if(acParts.msg)
				glob.notify(acParts.msg)
		},
		[acParts.msg]
	);

	return (
		 <ACPartsContext.Provider value={acParts}>
			<ACPartsDispatchContext.Provider value={acPartsDispatch}>
				{children}
			</ACPartsDispatchContext.Provider>
		</ACPartsContext.Provider>
	);
}
