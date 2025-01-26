import { useState, useContext } from 'react';

import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

import * as glob from '../Misc/Globals.js';

import {RicochetStateContext} from '../Contexts/RicochetStateContext.jsx'
import {RicochetStateDispatchContext} from '../Contexts/RicochetStateContext.jsx'

const PlotlyPlot = createPlotlyComponent(Plotly);

/***********************************************************************************/

const chargedSuffix = ' (Charged)';

function getRicochetUnits(charge) {
	const key = charge ? 'MaxChgRicochetRange' : 'MaxRicochetRange';
	const filtered = glob.partsData.filter(part => part['IdealRange'] && part[key]);
	return(
		filtered.map(
			part => {
				const id = part['ID'];
				let name = id == -1 ? '' : part['Name'];
				if(charge)
					name += chargedSuffix;				
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

const unitNameToID = Object.fromEntries(ricochetUnits.map(u => [u.name, u.id]));

ricochetUnits = ricochetUnits.map(unit => unit.name);
ricochetUnits.unshift('');

// CalcCorrectGraph 410, except x value for that is (defense - 1000) / 10
const ricochetDefBreakpoints = [
	[900., 0.45], [1000., 0.4], [1100., 0.3], [1300., 0.15], [1500, 0.]
];

/***********************************************************************************/

const DefenseInput = ({type}) => {

	const state = useContext(RicochetStateContext);
	const stateDispatch = useContext(RicochetStateDispatchContext);

	const setDefense = event => stateDispatch(
		{target: 'defense', pos: type, value: event.target.value}
	);	

	const filterKeys = event => {
		if(!/[0-9]/.test(event.key))
			event.preventDefault();		
	}

	const label = type.toUpperCase() + ' DEFENSE:';

	return(
		<div>
		<label style={{display: 'inline-block', width: '160px'}} htmlFor={type}>{label}</label>
		<input
			style={{width: '50px', margin: '0px 0px 10px 5px', backgroundColor: glob.paletteColor(3)}}
			id={type}
			value={state.defense[type]}
			onKeyPress={filterKeys}		
			onChange={setDefense}
		/>
		</div>
	)
}

const UnitDropDown = ({pos}) => {

	const state = useContext(RicochetStateContext);
	const stateDispatch = useContext(RicochetStateDispatchContext);

	const setUnit = event => stateDispatch(
		{target: 'units', pos: pos, value: event.target.value}
	);

	const id = 'dropdown-' + pos.toString();

	return (
		<div>
		<label htmlFor={id}>SELECT UNIT:</label>
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

const plotColors = 
	['rgb(61, 153, 204)', 'rgb(242, 160, 36)', 'rgb(116, 178, 54)', 'rgb(253, 98, 23)'];

const RicochetPlot = () => {
	const state = useContext(RicochetStateContext);

	let plotData = state.units.map(
		(name, pos) => {
			if(name === '')
				return null;
			const realName = name.replace(chargedSuffix, '');
			const partData = glob.partsData[unitNameToID[realName]];
			const ranges = name.endsWith(chargedSuffix) ? 
				[partData['ChgIdealRange'], partData['MaxChgRicochetRange']] :
				[partData['IdealRange'], partData['MaxRicochetRange']];
			const plotPoints = ricochetDefBreakpoints.map(
				([def, mult]) => [def, ranges[0] + mult * (ranges[1] - ranges[0])]
			);
			plotPoints.unshift(
				[800, ranges[0] + ricochetDefBreakpoints[0][1] * (ranges[1] - ranges[0])]
			);
			plotPoints.push([1600, ranges[0]]);
			return {
				x: plotPoints.map(([x, y]) => x),
				y: plotPoints.map(([x, y]) => y),
				mode: 'lines',
				line: {color: plotColors[pos]}
			}
		}
	);
	plotData = plotData.filter(data => data);

	const font = {family: 'Aldrich-Custom, sans-serif'};

	return (
		<div style={{width: '1000px', height: '600px'}}>
		<PlotlyPlot
			style={{width: '100%', height: '100%'}}
			data={plotData}
			layout={{
				margin: {l: 80, r: 80, t: 80, b: 80},
				xaxis: {
					range: [850, 1550],
					title: {text: 'Defense', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				yaxis: {
					range: [0, 600],
					title: {text: 'Ricochet Distance', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				showlegend: false,
				plot_bgcolor: 'rgb(255, 255, 255, 0.1)',
				paper_bgcolor: 'rgb(255, 255, 255, 0.1)'
			}}
			config={{displayModeBar: false, staticPlot: true}}
		/>
		</div>
	)
}

const RicochetComponent = () => {

	const state = useContext(RicochetStateContext);

	const range = [...Array(state.units.length).keys()];

	return(
		<>
		<DefenseInput type='kinetic' />
		<DefenseInput type='energy' />
		{
			range.map(pos => <UnitDropDown pos={pos} key={pos} />)
		}
		<RicochetPlot />
		</>
	);
}

export default RicochetComponent;