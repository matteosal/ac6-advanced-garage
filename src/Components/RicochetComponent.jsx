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
				let name = part['Name'];
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

function getRicochetRange(min, max, defense) {
	const mult = glob.piecewiseLinear(defense, ricochetDefBreakpoints);
	return min + mult * (max - min);
}

function getRangesAndType(fullName) {
	const realName = fullName.replace(chargedSuffix, '');
	const partData = glob.partsData[unitNameToID[realName]];
	const ranges = fullName.endsWith(chargedSuffix) ? 
		[partData['ChgIdealRange'], partData['MaxChgRicochetRange']] :
		[partData['IdealRange'], partData['MaxRicochetRange']];
	return[ranges, partData['AttackType']];
}

/***********************************************************************************/

const DefenseInput = ({type}) => {

	const state = useContext(RicochetStateContext);
	const stateDispatch = useContext(RicochetStateDispatchContext);

	const [internalValue, setInternalValue] = useState(state.defense[type]);

	const handleChange = event => setInternalValue(event.target.value);

	const handleKeyPress = event => {
		if(event.key === 'Enter')
			stateDispatch({target: 'defense', pos: type, value: internalValue})
		else if(!/[0-9]/.test(event.key))
			event.preventDefault();
	}

	const label = type.toUpperCase() + ' DEFENSE:';

	return(
		<div>
		<label style={{display: 'inline-block', width: '160px'}} htmlFor={type}>{label}</label>
		<input
			style={{width: '55px', margin: '0px 0px 10px 5px', 
				padding: '1px 5px', backgroundColor: glob.paletteColor(3)}}
			id={type}
			value={internalValue}
			onChange={handleChange}
			onKeyPress={handleKeyPress}
		/>
		</div>
	)
}

const UnitSelector = ({pos}) => {

	const state = useContext(RicochetStateContext);
	const stateDispatch = useContext(RicochetStateDispatchContext);

	const setUnit = event => stateDispatch(
		{target: 'units', pos: pos, value: event.target.value}
	);

	const selectedUnit = state.units[pos];
	const [ranges, type] = selectedUnit !== '' ? getRangesAndType(selectedUnit) : [0, 0];
	const ricochetRange = getRicochetRange(ranges[0], ranges[1], state.defense[type]);

	const id = 'dropdown-' + pos.toString();

	return (
		<div>
			<label htmlFor={id}>UNIT:</label>
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
			<div style={{display: 'inline-block', marginLeft: 15}}>
				RICOCHET RANGE:
			</div>
			<div style={{width: '15px', display: 'inline-block', marginLeft: 10}}>
			{
				ricochetRange ? 
					glob.toValueAndDisplayNumber(ricochetRange)[1] :
					''
			}
			</div>
		</div>
	)
}

const plotColors = 
	['rgb(61, 153, 204)', 'rgb(242, 160, 36)', 'rgb(116, 178, 54)', 'rgb(147, 130, 217)',
		'rgb(197, 110, 26)', 'rgb(204, 102, 194)'];
const plotDashing = {'Kinetic': '9px,3px', 'Energy': '2px,2px'}
const xRange = [850, 1550];

const RicochetPlot = () => {
	const state = useContext(RicochetStateContext);

	const kinDef = state.defense['Kinetic'];
	const enDef = state.defense['Energy'];

	const defPlotData = [
		{
			x: [kinDef, kinDef],
			y: [0, 1000],
			mode: 'lines',
			line: {dash: plotDashing['Kinetic'], color: 'rgb(253, 52, 45)'},
			name: 'Kinetic Defense',
			legendgroup: 'defense'
		},
		{
			x: [enDef, enDef],
			y: [0, 1000],
			mode: 'lines',
			line: {dash: plotDashing['Energy'], color: 'rgb(253, 52, 45)'},
			name: 'Energy Defense',
			legendgroup: 'defense'
		}		
	];

	let unitPlotData = state.units.map(
		(name, pos) => {
			if(name === '')
				return null;
			const [ranges, atkType] = getRangesAndType(name);
			const plotPoints = ricochetDefBreakpoints.map(
				([def, mult]) => [def, getRicochetRange(ranges[0], ranges[1], def)]
			);
			plotPoints.unshift(
				[xRange[0], getRicochetRange(ranges[0], ranges[1], xRange[0])]
			);
			plotPoints.push(
				[xRange[1], getRicochetRange(ranges[0], ranges[1], xRange[1])]
			);
			const pairedDef = state.defense[atkType];
			return [
				{
					x: plotPoints.map(([x, y]) => x),
					y: plotPoints.map(([x, y]) => y),
					mode: 'lines',
					line: {dash: plotDashing[atkType], color: plotColors[pos]},
					name: name,
					legendgroup: 'units'
				},
				{
					x: [pairedDef],
					y: [getRicochetRange(ranges[0], ranges[1], pairedDef)],
					mode: 'markers',
					marker: {color: plotColors[pos], size: 10},
					showlegend: false
				}
			]
		}
	);
	unitPlotData = unitPlotData.filter(data => data).flat();

	const plotData = defPlotData.concat(unitPlotData);

	const font = {family: 'Aldrich-Custom, sans-serif', color: 'white'};

	const maxY = Math.max(430, 1.05 * Math.max(...unitPlotData.map(d => d.y).flat()));

	return (
		<PlotlyPlot
			style={{width: '100%', height: '100%'}}
			data={plotData}
			layout={{
				margin: {l: 80, r: 40, t: 40, b: 60},
				xaxis: {
					range: xRange,
					title: {text: 'Defense', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				yaxis: {
					range: [0, maxY],
					title: {text: 'Ricochet Range', font: font, standoff: 5},
					tickfont: font,
					color: 'white'
				},
				legend: {x: 1, y: 1, xanchor: 'right', font: font,
					bgcolor: glob.paletteColor(1)},
				plot_bgcolor: 'rgb(255, 255, 255, 0.1)',
				paper_bgcolor: 'rgb(255, 255, 255, 0.1)'
			}}
			config={{displayModeBar: false, staticPlot: true}}
		/>
	)
}

const RicochetComponent = () => {

	const state = useContext(RicochetStateContext);

	const ranges = glob.partitionList([...Array(state.units.length).keys()], 3);

	return(
		<>
		<div 
			style={{display: 'flex', justifyContent: 'space-evenly', 
				alignItems: 'center', margin: '50px 0px 25px 0px', padding: '25px 0px 10px 0px',
				...glob.dottedBackgroundStyle()}}
		>
			<div>
				<DefenseInput type='Kinetic' />
				<DefenseInput type='Energy' />
			</div>
			{
				ranges.map(
					range => <div>
						{
							range.map(pos => <UnitSelector pos={pos} key={pos} />)
						}
					</div>
				)
			}
		</div>
		<div style={{width: '1070px', height: '630px', margin: 'auto'}}>
			<RicochetPlot />
		</div>
		</>
	);
}

export default RicochetComponent;