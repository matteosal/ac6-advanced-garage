import { useReducer, createContext } from 'react';

import {starterAssembly} from '../Misc/BuildImportExport.js'

export const ComparerStateContext = createContext(null);
export const ComparerStateDispatchContext = createContext(null);

/***************************************************************************************/

const comparerStateReducer = (state, action) => {
	const newState = {...state};

	console.log(newState[action.target][action.pos]);
	console.log(!newState[action.target][action.pos]);	

	if(action.target === 'showTooltip')
		newState.showTooltip = !newState.showTooltip;
	else if(action.target === 'builds')
		newState.builds[action.pos] = action.value;
	else
		newState[action.target][action.pos] = !newState[action.target][action.pos]

	console.log(newState);

	return newState
}

/***************************************************************************************/

const initialComparerState = {
	builds: new Array(4).fill(starterAssembly),
	showTooltip: true,
	showStats: new Array(4).fill(false),
	checked: new Array(4).fill(false)
}

// This will probably be overkill in the end
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
