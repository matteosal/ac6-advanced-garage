import { useReducer, useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {parseBuildQuery} from '../Misc/BuildImportExport.js'
import {ComparerPartsContext, ComparerPartsDispatchContext} from 
	'../Contexts/ComparerPartsContext.jsx'

import ACAssembly from './ACAssembly.jsx'
import ACStats from './ACStats.jsx'

const showStatsReducer = (showStats, pos) => {
	const res = [...showStats];
	res[pos] = !res[pos];
	return res;
}

const CompareBuildsComponent = () => {
	const comparerParts = useContext(ComparerPartsContext);
	const comparerPartsDispatch = useContext(ComparerPartsDispatchContext);

	const [showStats, toogleShowStats] = useReducer(
		showStatsReducer,
		null,
		() => new Array(comparerParts.length).fill(false)
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
		comparerPartsDispatch({pos: pos, parts: build})
	}

	return (
		<div style={{display: 'flex', justifyContent: 'space-around'}}>
		{
			comparerParts.map(
				(build, pos) => {
					return(
						<div key={pos}>
							<div style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', margin: 'auto'}}>
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
								<ACStats acParts={build} preview={{slot: null, part: null}} /> :
								<ACAssembly parts={build} previewSetter={null} />
							}
						</div>
					)
				}
			)
		}
		</div>
	)
}

export default CompareBuildsComponent;