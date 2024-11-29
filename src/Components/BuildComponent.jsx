import { useReducer, useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {copyBuildLink} from "../Misc/BuildImportExport.js";

import {BuilderPartsContext} from '../Contexts/BuilderPartsContext.jsx'

import ACAssembly from './ACAssembly.jsx';
import PartsExplorer from './PartsExplorer.jsx';
import PartStats from './PartStats.jsx';
import ACStats from './ACStats.jsx';
import Title from './Title.jsx';

const previewReducer = (preview, action) => {
	if(action.slot === null) {
		// Set slot to null means close the part explorer. Reached by keydown handler (ESC)
		return {slot: null, part: null}
	} else if(action.slot !== undefined) { 
		return {slot: action.slot, part: null}
	} else // Set part without changing slot
		return {slot: preview.slot, part: action.part}
}

const BuildComponent = () => {

	const [preview, previewDispatch] = useReducer(
		previewReducer,
		{slot: null, part: null}
	)

	const parts = useContext(BuilderPartsContext).parts;

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
					<ACAssembly parts={parts} previewSetter={slot => previewDispatch({slot: slot})}/>
					<div style={{display: 'flex', width: '100%', height: '50px', 
						background: glob.paletteColor(3)}}>
						<button style={{margin: 'auto'}} onClick={() => copyBuildLink(parts)}>
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
					<PartsExplorer 
						previewSlot={preview.slot}
						previewDispatch={previewDispatch}
					/>
				</div>
				<div style={
					{display: 'inline-block', width: '65%', verticalAlign: 'top', 
						marginLeft: '2.5%', marginRight: '2.5%', marginTop: '35px'}
				}>
					<PartStats 
						preview={preview}
					/>
				</div>
				</>
		}
		</div>
		<div style={
			{display: 'inline-block', width: '35%', marginTop: '35px', verticalAlign: 'top'}
		}>
			<ACStats preview={preview}/>
		</div>
		</>
	)
}

export default BuildComponent;