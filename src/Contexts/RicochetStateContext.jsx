import { useReducer, createContext } from 'react';

export const RicochetStateContext = createContext(null);
export const RicochetStateDispatchContext = createContext(null);

/***************************************************************************************/

const ricochetStateReducer = (state, action) => {
	const newState = {...state};
	newState[action.target][action.pos] = action.value;
	return newState
}

/***************************************************************************************/

const initialRicochetState = {
	defense: {'Kinetic': 1150, 'Energy': 1250},
	units: new Array(4).fill('')
}

export const RicochetStateProvider = ({children}) => {
	const [ricochetState, ricochetStateDispatch] = useReducer(
		ricochetStateReducer,
		null,
		() => initialRicochetState
	);

	return (
		 <RicochetStateContext.Provider value={ricochetState}>
			<RicochetStateDispatchContext.Provider value={ricochetStateDispatch}>
				{children}
			</RicochetStateDispatchContext.Provider>
		</RicochetStateContext.Provider>
	);
}
