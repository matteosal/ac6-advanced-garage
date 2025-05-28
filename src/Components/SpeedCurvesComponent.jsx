import { useState, useContext } from 'react';

import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

import * as glob from '../Misc/Globals.js';
import {speedBreakpoints} from './ACStats.jsx';

import {SpeedCurvesStateContext} from '../Contexts/SpeedCurvesStateContext.jsx'
import {SpeedCurvesStateDispatchContext} from '../Contexts/SpeedCurvesStateContext.jsx'

const PlotlyPlot = createPlotlyComponent(Plotly);

/***********************************************************************************/

const breakpoints = Object.fromEntries(
	Object.entries(speedBreakpoints).filter(
		([key, bps]) => key !== 'boostAerial' && key !== 'hoverQuickBoost'
	).map(
		([key, bps]) => [key, bps[0].map(([x, y]) => [x * 10000, y])]
	)
);

console.log(breakpoints);

const WeightInput = ({type}) => {

	const state = useContext(SpeedCurvesStateContext);
	const stateDispatch = useContext(SpeedCurvesStateDispatchContext);

	const [internalValue, setInternalValue] = useState(state.weight);

	const handleChange = event => {
		const val = event.target.value;
		setInternalValue(val);
		if(val > xRange[0] && val < xRange[1]) {
			stateDispatch({target: 'weight', value: val})
		}
	};

	const handleKeyPress = event => {
		if(!/[0-9]/.test(event.key))
			event.preventDefault();
	}

	const handleFocusOut = event => {
		const val = event.target.value;
		if(val < xRange[0]) {
			setInternalValue(xRange[0]);
			stateDispatch({target: 'weight', value: xRange[0]})
		}
		else if(val > xRange[1]) {
			setInternalValue(xRange[1]);
			stateDispatch({target: 'weight', value: xRange[1]})
		}
	}

	return(
		<div>
		<label style={{display: 'inline-block', width: '160px'}} htmlFor={type}>
			{'WEIGHT'}
		</label>
		<input
			style={{width: '65px', margin: '0px 0px 10px 5px', 
				padding: '1px 5px', backgroundColor: glob.paletteColor(3)}}
			id={type}
			value={internalValue}
			onChange={handleChange}
			onKeyPress={handleKeyPress}
			onBlur={handleFocusOut}
		/>
		</div>
	)
}

const CurveLabel = ({pos}) => {

	const state = useContext(SpeedCurvesStateContext);
	const stateDispatch = useContext(SpeedCurvesStateDispatchContext);

	return (
		<div style={{display: 'flex'}}>
			<button>EYE</button>
			{glob.toDisplayString(Object.keys(breakpoints)[pos])}
		</div>
	)
}

const plotColors = 
	['rgb(61, 153, 204)', 'rgb(242, 160, 36)', 'rgb(116, 178, 54)', 'rgb(147, 130, 217)',
		'rgb(197, 110, 26)', 'rgb(204, 102, 194)'];
const plotDashing = {'Kinetic': '9px,3px', 'Energy': '2px,2px'}
const xRange = [30000, 160000];

/*const RicochetPlot = () => {
	const state = useContext(SpeedCurvesStateContext);

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

	const font = {family: 'Aldrich-Custom, sans-serif', color: 'white', size: 16};

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
}*/

const SpeedCurvesComponent = () => {

	const state = useContext(SpeedCurvesStateContext);

	const nCurves = Object.keys(breakpoints).length;
	const ranges = glob.partitionList(
		[...Array(nCurves).keys()],
		3
	);

	return(
		<>
		<div 
			style={{display: 'flex', justifyContent: 'space-evenly', 
				alignItems: 'center', margin: '50px 0px 25px 0px', padding: '25px 0px 10px 0px',
				...glob.dottedBackgroundStyle()}}
		>
			<div>
				<WeightInput type='Kinetic' />
			</div>
			{
				ranges.map(
					range => <div key={range}>
						{
							range.map(pos => pos !== null ? 
								<CurveLabel pos={pos} key={pos} /> :
								<></>)
						}
					</div>
				)
			}
		</div>
{/*		<div style={{width: '1070px', height: '630px', margin: 'auto'}}>
			<RicochetPlot />
		</div>*/}
		</>
	);
}

export default SpeedCurvesComponent;