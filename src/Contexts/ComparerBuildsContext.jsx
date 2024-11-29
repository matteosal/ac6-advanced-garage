import { useReducer, createContext } from 'react';

import {starterAssembly} from '../Misc/BuildImportExport.js'

export const ComparerBuildsContext = createContext(null);
export const ComparerBuildsDispatchContext = createContext(null);

/***************************************************************************************/

const comparerPartsReducer = (comparerParts, action) => {
	const newParts = [...comparerParts];
	newParts[action.pos] = action.parts;
	return newParts
}

/***************************************************************************************/

// This will probably be overkill in the end
export const ComparerBuildsProvider = ({children}) => {
	const [comparerParts, comparerPartsDispatch] = useReducer(
		comparerPartsReducer,
		null,
		() => new Array(4).fill(starterAssembly)
	);

	return (
		 <ComparerBuildsContext.Provider value={comparerParts}>
			<ComparerBuildsDispatchContext.Provider value={comparerPartsDispatch}>
				{children}
			</ComparerBuildsDispatchContext.Provider>
		</ComparerBuildsContext.Provider>
	);
}
