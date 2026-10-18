import { useReducer, createContext } from 'react';

import {getDefaultOptimizerInputs} from '../Misc/Optimizer.js';

export const OptimizerStateContext = createContext(null);
export const OptimizerStateDispatchContext = createContext(null);

/***************************************************************************************/

const optimizerStateReducer = (state, action) => {
	const newState = {...state};

	if(action.target === 'equipment')
		newState.equipment = {...state.equipment, [action.key]: action.value};
	else if(action.target === 'parts')
		newState.parts = {...state.parts, [action.key]: action.value};
	else if(action.target === 'legTypes')
		newState.legTypes = {...state.legTypes, [action.key]: action.value};
	else if(action.target === 'thresholds')
		newState.thresholds = {...state.thresholds, [action.key]: action.value};
	else if(action.target === 'weights')
		newState.weights = {...state.weights, [action.key]: action.value};
	else
		newState[action.target] = action.value;

	return newState;
}

/***************************************************************************************/

export const OptimizerStateProvider = ({children}) => {
	const [optimizerState, optimizerStateDispatch] = useReducer(
		optimizerStateReducer,
		null,
		() => getDefaultOptimizerInputs()
	);

	return (
		<OptimizerStateContext.Provider value={optimizerState}>
			<OptimizerStateDispatchContext.Provider value={optimizerStateDispatch}>
				{children}
			</OptimizerStateDispatchContext.Provider>
		</OptimizerStateContext.Provider>
	);
}
