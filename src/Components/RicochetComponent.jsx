import { useState, useContext } from 'react';

import * as glob from '../Misc/Globals.js';

import {RicochetStateContext} from '../Contexts/RicochetStateContext.jsx'
import {RicochetStateDispatchContext} from '../Contexts/RicochetStateContext.jsx'

function getRicochetUnits(charge) {
	const key = charge ? 'MaxChgRicochetRange' : 'MaxRicochetRange';
	const filtered = glob.partsData.filter(part => part['IdealRange'] && part[key]);
	return(
		filtered.map(
			part => {
				const id = part['ID'];
				let name = id == -1 ? '' : part['Name'];
				if(charge)
					name += ' (Charged)';				
				return {name: name, id: id, charge: charge}
			}
		)
	)
}

let ricochetUnits = getRicochetUnits(false).concat(getRicochetUnits(true));
ricochetUnits.sort(
	(a, b) => {
		if(a.id === b.id)
			return a.charge ? 1 : -1;
		const partA = glob.partsData[a.id];
		const partB = glob.partsData[b.id];
		if(partA['RightArm'] && !partB['RightArm'])
			return -1;
		else if(!partA['RightArm'] && partB['RightArm'])
			return 1;
		else
			return partA['DefaultOrdering'] - partB['DefaultOrdering'];
	}
);
ricochetUnits = ricochetUnits.map(unit => unit.name);
ricochetUnits.unshift('');

const UnitDropDown = ({pos}) => {

	const state = useContext(RicochetStateContext);
	const stateDispatch = useContext(RicochetStateDispatchContext);

	const setUnit = event => stateDispatch(
		{target: 'units', pos: pos, value: event.target.value}
	);

	const id = 'dropdown-' + pos.toString();

	return (
		<div>
		<label htmlFor={id}>
			SELECT UNIT:
		</label>		
		<select 
			style={{margin: '0px 0px 10px 5px'}}
			id={id}
			value={state.units[pos]}
			onChange={setUnit}
		>
			{
				ricochetUnits.map(
					name => <option value={name} key={name}>{name}</option>
				)
			}
		</select>
		</div>
	)
}

const RicochetComponent = () => {

	const state = useContext(RicochetStateContext);

	const range = [...Array(state.units.length).keys()];

	return(
		<>
		{
			range.map(pos => <UnitDropDown pos={pos} key={pos} />)
		}
		</>
	);
}

export default RicochetComponent;