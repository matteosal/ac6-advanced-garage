import { useReducer, createContext } from 'react';

import * as glob from '../Misc/Globals.js';

export const TablesStateContext = createContext(null);
export const TablesStateDispatchContext = createContext(null);

/***************************************************************************************/

const tablesStateReducer = (state, action) => {
	const newState = {...state};	

	if(action.target === 'selectedClass')
		newState[action.target] = action.value;
	else
		newState[action.target][action.partClass] = action.value;

	return newState
}

/***************************************************************************************/

const initialTablesState = {
	selectedClass: 'armUnit',
	columnOrder: Object.fromEntries(
		glob.partClasses.map(
			partClass => [partClass, glob.defaultTableColumns[partClass]]
		)
	),
	sorting: Object.fromEntries(
		glob.partClasses.map(
			partClass => [partClass, {key: 'Name', ascend: true}]
		)
	),
	unitFilters: {
		'armUnit': {'AttackType': [], 'WeaponType': [], 'ReloadType': [], 'AdditionalEffect': []},
		'backUnit': {'AttackType': [], 'WeaponType': [], 'ReloadType': [], 'AdditionalEffect': []}
	}
}

export const TablesStateProvider = ({children}) => {
	const [tablesParts, tablesPartsDispatch] = useReducer(
		tablesStateReducer,
		null,
		() => initialTablesState
	);

	return (
		 <TablesStateContext.Provider value={tablesParts}>
			<TablesStateDispatchContext.Provider value={tablesPartsDispatch}>
				{children}
			</TablesStateDispatchContext.Provider>
		</TablesStateContext.Provider>
	);
}
