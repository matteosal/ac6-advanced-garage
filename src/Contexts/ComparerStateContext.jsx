import { useReducer, createContext } from 'react';

import {starterAssembly} from '../Misc/BuildImportExport.js'

export const ComparerStateContext = createContext(null);
export const ComparerStateDispatchContext = createContext(null);

/***************************************************************************************/

const comparerStateReducer = (state, action) => {
	const newState = {...state};

	if(['builds', 'inputFieldStrings'].includes(action.target))
		newState[action.target][action.pos] = action.value;
	else
		newState[action.target][action.pos] = !newState[action.target][action.pos]

	return newState
}

/***************************************************************************************/

const initialComparerState = {
	builds: new Array(4).fill(starterAssembly),
	showStats: new Array(4).fill(false),
	checked: new Array(4).fill(false),
	inputFieldStrings: new Array(4).fill('')
}

export const ComparerStateProvider = ({children}) => {
	const [comparerParts, comparerPartsDispatch] = useReducer(
		comparerStateReducer,
		null,
		() => initialComparerState
	);

	return (
		 <ComparerStateContext.Provider value={comparerParts}>
			<ComparerStateDispatchContext.Provider value={comparerPartsDispatch}>
				{children}
			</ComparerStateDispatchContext.Provider>
		</ComparerStateContext.Provider>
	);
}
