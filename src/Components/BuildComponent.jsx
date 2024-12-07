import { useReducer, useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {copyBuildLink} from "../Misc/BuildImportExport.js";

import {BuilderStateContext} from '../Contexts/BuilderStateContext.jsx'
import {BuilderStateDispatchContext} from '../Contexts/BuilderStateContext.jsx'

import ACAssembly from './ACAssembly.jsx';
import PartsExplorer from './PartsExplorer.jsx';
import PartStats from './PartStats.jsx';
import ACStats from './ACStats.jsx';
import Title from './Title.jsx';

const BuildComponent = () => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	const preview = state.preview;
	const acParts = state.parts;

	let comparedParts;
	if(preview.part === null)
		comparedParts = null
	else {
		comparedParts = {...acParts};
		comparedParts[preview.slot] = preview.part;
		if(
			comparedParts.legs['LegType'] !== 'Tank' && 
			comparedParts.booster['ID'] === glob.noneBooster['ID']
		) {
			// This happens when the current AC has tank legs and the preview has non-tank legs
			comparedParts.booster = glob.defaultBooster;
		}
	}

	return(
		<>
		<div style={
			{display: 'inline-block', width: '65%', verticalAlign: 'top'}
		}>
		{
			preview.slot === null ?
				<>
				<div style={{display:'inline-block', width: '35%', marginTop: '40px'}}>
					<div style={
						{
							...glob.dottedBackgroundStyle(),
							...{display: 'flex', width: '99%', height: '45px', 
								margin: '0px auto 5px auto', 
								border: 'solid 2px ' + glob.paletteColor(4)}
						}
					}>
						<div style={{margin: 'auto', fontSize: '20px'}}>ASSEMBLY</div>
					</div>				
					<ACAssembly
						parts={acParts}
						previewSetter={slot => stateDispatch({target: 'preview', slot: slot})}
					/>
					<div style={{display: 'flex', width: '100%', height: '50px', 
						background: glob.paletteColor(3)}}>
						<button style={{margin: 'auto'}} onClick={() => copyBuildLink(acParts)}>
							CREATE BUILD LINK
						</button>
					</div>
				</div>
				<div style={{display:'inline-block', verticalAlign: 'top', width: '65%'}}>
					<Title />
				</div>
				</> 
				:
				<>
				<div style={
					{display: 'inline-block', width: '30%', verticalAlign: 'top'}
				}>
					<PartsExplorer />
				</div>
				<div style={
					{display: 'inline-block', width: '65%', verticalAlign: 'top', 
						marginLeft: '2.5%', marginRight: '2.5%', marginTop: '35px'}
				}>
					<PartStats />
				</div>
				</>
		}
		</div>
		<div style={
			{display: 'inline-block', width: '35%', marginTop: '35px', verticalAlign: 'top',
				height: '805px'}
		}>
			<ACStats acParts={acParts} comparedParts={comparedParts}/>
		</div>
		</>
	)
}

export default BuildComponent;