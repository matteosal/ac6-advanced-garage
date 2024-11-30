import { useReducer, useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {parseBuildQuery} from '../Misc/BuildImportExport.js'
import {ComparerBuildsContext, ComparerBuildsDispatchContext} from 
	'../Contexts/ComparerBuildsContext.jsx'

import ACAssembly from './ACAssembly.jsx'
import ACStats from './ACStats.jsx'

const booleanListReducer = (state, pos) => {
	const res = [...state];
	res[pos] = !res[pos];
	return res;
}

const ComparerColumnHeader = ({pos, inputHandler, showStats, toggleShowStats}) => {
	return(
		<div style={{...glob.dottedBackgroundStyle(), padding: '10px 0px', 
			marginBottom: '10px'}}>
		<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',
			gap: '10px', padding: '0px 0px 10px 0px'}}>
			<div style={{width: 'auto'}}>BUILD LINK:</div>
			<form onSubmit={event => inputHandler(event, pos)}>
				<input
					style={{width: '170px', height: '30px', 
						backgroundColor: glob.paletteColor(3)}}
				/>
			<input type="submit" value="LOAD" style={{marginLeft: '10px', padding: '3px 10px'}}/>
			</form>
		</div>
		<button 
			style={{display: 'block', margin: 'auto', width: '200px'}}
			onClick={() => toggleShowStats(pos)}
		>
			{showStats[pos] ? 'SHOW ASSEMBLY' : 'SHOW SPECS'}
		</button>
		</div>
	)
}

const ComparerColumn = (params) => {
	const {build, pos, inputHandler, showStats, comparedBuilds, compareSwitches, 
		toggleShowStats, toggleCompareSwitches} = params;
	return(
		<div style={{width: '24%'}}>
			<ComparerColumnHeader
				pos={pos}
				inputHandler={inputHandler}
				showStats={showStats}
				toggleShowStats={toggleShowStats}
			/>
			<div style={{height: '655px', marginBottom: '5px'}}>
				{
					showStats[pos] ? 
					<ACStats 
						acParts={build}
						comparedParts={comparedBuilds[pos]}
						buildCompareMode={true}
					/> :
					<ACAssembly parts={build} previewSetter={null} />
				}
			</div>
			<input
				type="checkbox"
				disabled={
					!compareSwitches[pos] && 
					compareSwitches.filter(b => b === true).length === 2
				}
				checked={compareSwitches[pos]}
				onChange={() => toggleCompareSwitches(pos)}
			/>
		</div>
	)
}

const CompareBuildsComponent = () => {
	const builds = useContext(ComparerBuildsContext);
	const buildsDispatch = useContext(ComparerBuildsDispatchContext);

	const [showStats, toggleShowStats] = useReducer(
		booleanListReducer,
		null,
		() => new Array(builds.length).fill(false)
	);

	const [compareSwitches, toggleCompareSwitches] = useReducer(
		booleanListReducer,
		null,
		() => new Array(builds.length).fill(false)
	);

	const inputHandler = (event, pos) => {
		event.preventDefault();
		let query;
		try {
			const url = new URL(event.currentTarget[0].value);
			const params = new URLSearchParams(url.search);
			query = params.get('build')
		} catch {
			query = ''
		}
		const build = parseBuildQuery(query);
		buildsDispatch({pos: pos, parts: build})
	}

	// Detect if two comparison checkbox are ticked and set the compared builds
	// accordingly
	let comparedBuildsPos = [];
	compareSwitches.map((b, pos) => {
		if(b) comparedBuildsPos.push(pos);
		return null;
	});
	let comparedBuilds = new Array(builds.length).fill(null);
	if(comparedBuildsPos.length === 2) {
		comparedBuilds[comparedBuildsPos[0]] = builds[comparedBuildsPos[1]];
		comparedBuilds[comparedBuildsPos[1]] = builds[comparedBuildsPos[0]];
	}

	return (
		<div style={{display: 'flex', justifyContent: 'space-around', marginTop: '25px'}}>
		{
			builds.map(
				(build, pos) => {
					return(
						<ComparerColumn
							build={build}
							pos={pos}
							inputHandler={inputHandler}
							showStats={showStats}
							comparedBuilds={comparedBuilds}
							compareSwitches={compareSwitches}
							toggleShowStats={toggleShowStats}
							toggleCompareSwitches={toggleCompareSwitches}
							key={pos}
						/>
					)
				}
			)
		}
		</div>
	)
}

export default CompareBuildsComponent;