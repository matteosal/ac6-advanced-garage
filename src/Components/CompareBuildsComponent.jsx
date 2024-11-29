import { useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {parseBuildQuery} from '../Misc/BuildImportExport.js'
import {ComparerPartsContext, ComparerPartsDispatchContext} from 
	'../Contexts/ComparerPartsContext.jsx'

import ACAssembly from './ACAssembly.jsx'

const CompareBuildsComponent = () => {
	const comparerParts = useContext(ComparerPartsContext);
	const comparerPartsDispatch = useContext(ComparerPartsDispatchContext);

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
							<ACAssembly parts={build} previewSetter={null} />
						</div>
					)
				}
			)
		}
		</div>
	)
}

export default CompareBuildsComponent;