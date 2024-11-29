import { useReducer, createContext } from 'react';

import {starterAssembly} from '../Misc/BuildImportExport.js'

export const ComparerPartsContext = createContext(null);
export const ComparerPartsDispatchContext = createContext(null);

/***************************************************************************************/

const comparerPartsReducer = (comparerParts, action) => {
	const newParts = [...comparerParts];
	newParts[action.pos] = action.parts;
	return newParts
}

/***************************************************************************************/

export const ComparerPartsProvider = ({children}) => {
	const [comparerParts, comparerPartsDispatch] = useReducer(
		comparerPartsReducer,
		null,
		() => [starterAssembly, starterAssembly, starterAssembly, starterAssembly]
	);

	return (
		 <ComparerPartsContext.Provider value={comparerParts}>
			<ComparerPartsDispatchContext.Provider value={comparerPartsDispatch}>
				{children}
			</ComparerPartsDispatchContext.Provider>
		</ComparerPartsContext.Provider>
	);
}
