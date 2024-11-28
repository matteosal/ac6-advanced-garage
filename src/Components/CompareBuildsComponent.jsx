import { useContext } from 'react';

import {ComparerPartsContext} from '../Contexts/ComparerPartsContext.jsx'

import ACAssembly from './ACAssembly.jsx'

const CompareBuildsComponent = () => {
	const builds = useContext(ComparerPartsContext);
	return (
		<div style={{display: 'flex', justifyContent: 'space-around'}}>
		{
			builds.map(
				build => {
					return(
						<div>
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