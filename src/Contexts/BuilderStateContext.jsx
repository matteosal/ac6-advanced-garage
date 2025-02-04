import { useReducer, createContext, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom'

import * as glob from '../Misc/Globals.js';
import {parseBuildQuery, starterAssembly} from '../Misc/BuildImportExport.js'

export const BuilderStateContext = createContext(null);
export const BuilderStateDispatchContext = createContext(null);

/***************************************************************************************/

const builderPartsReducer = (builderParts, action) => {

	const newParts = {...builderParts};
	let newMsg = null;
	const newPart = glob.partsData[action.id];
	// Check if e.g. right arm unit is already placed in right shoulder slot and remove it
	// from old slot
	if(newPart['ID'] !== glob.noneUnit['ID']) {
		Object.entries(glob.pairedUnitSlots).forEach(([slot1, slot2]) => {
			if(action.slot === slot1 && builderParts[slot2]['ID'] === newPart['ID']) {
				const slotDisplayString = glob.splitCamelCase(slot2).toLowerCase();
				newMsg = 'Unit removed from ' + slotDisplayString + ' slot';
				newParts[slot2] = glob.noneUnit;
			}
		})
	}
	// Manage tank legs and boosters
	if(action.slot === 'legs') {
		if(newPart['LegType'] === 'Tank') {
			if(builderParts.booster['ID'] !== glob.noneBooster['ID']) {
				newParts.booster = glob.noneBooster;
				newMsg = 'Booster removed';
			}
		} else if(newPart['LegType'] !== 'Tank') {
			if(builderParts.booster['ID'] === glob.noneBooster['ID']) {
				newParts.booster = glob.defaultBooster;
				newMsg = 'Booster \'' + glob.defaultBooster['Name'] + '\' added';
			}
		}
	}
	newParts[action.slot] = newPart;

	return {parts: newParts, toastMsg: newMsg}
}

const previewReducer = (preview, action) => {
	if(action.slot === null) {
		// Set slot to null means close the part explorer. Reached by keydown handler (ESC)
		return {slot: null, part: null}
	} else if(action.slot !== undefined) { 
		return {slot: action.slot, part: null}
	} else // Set part without changing slot
		return {slot: preview.slot, part: action.part}
}

const builderStateReducer = (builderState, action) => {
	const newState = {...builderState};

	if(action.target === 'part') {
		const res = builderPartsReducer(builderState.parts, action);
		newState.parts = res.parts;
		newState.toastMsg = res.toastMsg;
		newState.preview = {slot: builderState.preview.slot, part: null};
	} else if(action.target === 'allParts') {
		newState.parts = action.value;
	} else if(action.target === 'preview') {
		const res = previewReducer(builderState.preview, action);
		newState.preview = res;
	} else if(action.target === 'sortBy') {
		newState.sortBy[action.slot] = action.value;
	} else
		newState[action.target] = action.value;

	return newState;
}

/***************************************************************************************/

const initialBuilderState = {
	parts: null, // this is immediately filled below
	preview: {slot: null, part: null},
	backSubslot: 0,
	sortBy: Object.fromEntries(
		glob.partSlots.map(slot =>
			{return [slot, {key: 'DefaultOrdering', ascend: true}]}
		)
	),
	toastMsg: null,
	showModifiedSpecs: false,
	normalizationKey: '',
	inputFieldString: ''
}

export const BuilderStateProvider = ({children}) => {
	const [searchParams] = useSearchParams();

	const [builderState, builderStateDispatch] = useReducer(
		builderStateReducer,
		null,
		() => {
			const init = {...initialBuilderState};
			const query = searchParams.get('build');
			const assembly = query ? parseBuildQuery(query) : starterAssembly;
			init.parts = assembly;
			return init
		}
	);

	// We want the reducer to display toasts but we can't do it directly from there because
	// that triggers a rendering during rendering and react emits a warning. So we add the
	// message to the state, we let the reducer set it and we check it later in the useEffect
	// of this component
	useEffect(() => 
		{
			if(builderState.toastMsg)
				glob.notify(builderState.toastMsg)
		},
		[builderState.toastMsg]
	);

	return (
		 <BuilderStateContext.Provider value={builderState}>
			<BuilderStateDispatchContext.Provider value={builderStateDispatch}>
				{children}
			</BuilderStateDispatchContext.Provider>
		</BuilderStateContext.Provider>
	);
}
