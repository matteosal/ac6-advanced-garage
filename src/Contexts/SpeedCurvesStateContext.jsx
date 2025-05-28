import { useReducer, createContext } from 'react';

export const SpeedCurvesStateContext = createContext(null);
export const SpeedCurvesStateDispatchContext = createContext(null);

/***************************************************************************************/

const speedCurvesStateReducer = (state, action) => {
	const newState = {...state};
	newState[action.target] = action.value;
	return newState
}

/***************************************************************************************/

const initialSpeedCurvesState = {
	weight: 75000
}

export const SpeedCurvesStateProvider = ({children}) => {
	const [speedCurvesState, speedCurvesStateDispatch] = useReducer(
		speedCurvesStateReducer,
		null,
		() => initialSpeedCurvesState
	);

	return (
		 <SpeedCurvesStateContext.Provider value={speedCurvesState}>
			<SpeedCurvesStateDispatchContext.Provider value={speedCurvesStateDispatch}>
				{children}
			</SpeedCurvesStateDispatchContext.Provider>
		</SpeedCurvesStateContext.Provider>
	);
}
