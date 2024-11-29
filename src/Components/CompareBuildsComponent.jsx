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

const CompareBuildsComponent = () => {
	const builds = useContext(ComparerBuildsContext);
	const buildsDispatch = useContext(ComparerBuildsDispatchContext);

	const [showStats, toogleShowStats] = useReducer(
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

	console.log(comparedBuilds);

	return (
		<div style={{display: 'flex', justifyContent: 'space-around'}}>
		{
			builds.map(
				(build, pos) => {
					return(
						<div style={{width: '24%'}} key={pos}>
							<div style={{display: 'flex', alignItems: 'center', gap: '10px', 
								width: '100%', margin: 'auto'}}>
								<div>ENTER LINK:</div>
								<form onSubmit={event => inputHandler(event, pos)}>
									<input
										style={{
											height: '25px',
											margin: '5px 0px 5px 0px',
											backgroundColor: glob.paletteColor(3)
										}}
									/>
								</form>
							</div>
							<button 
								style={{display: 'block', margin: 'auto'}}
								onClick={() => toogleShowStats(pos)}
							>
								{showStats[pos] ? 'SHOW ASSEMBLY' : 'SHOW SPECS'}
							</button>
							{
								showStats[pos] ? 
								<ACStats 
									acParts={build}
									comparedParts={comparedBuilds[pos]}
									buildCompareMode={true}
								/> :
								<ACAssembly parts={build} previewSetter={null} />
							}
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
			)
		}
		</div>
	)
}

export default CompareBuildsComponent;