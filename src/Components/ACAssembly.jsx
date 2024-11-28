import { useState, useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {copyBuildLink} from "../Misc/BuildImportExport.js";
import {BuilderPartsContext} from "../Contexts/BuilderPartsContext.jsx";

const AssemblyBox = ({partName, manufacturer, slot, previewSetter, inactive}) => {
	const [highlighted, setHighlighted] = useState(false)

	let mouseEnter, mouseLeave, mouseClick;
	if(inactive) {
		mouseEnter = () => {};
		mouseLeave = () => {};
		mouseClick = () => {};
	} else {
		mouseEnter = () => setHighlighted(true);
		mouseLeave = () => setHighlighted(false);
		mouseClick = () => previewSetter(slot);		
	}

	const slotImg = glob.slotImages[glob.toImageFileName(slot)];
	let manImg;
	if(manufacturer !== undefined)
		manImg = glob.manufacturerLogos[glob.toImageFileName(manufacturer)];
	else
		manImg = null;

	const background = highlighted ? glob.paletteColor(5, 0.75) : glob.paletteColor(2, 0.5);
	const color = inactive ? 'gray' : 'inherit';

	return (
		<div
			style = {
				{border: 'solid 1px gray', padding: '5px', background: background, 
					cursor: 'pointer'}
			}
			onMouseEnter = {mouseEnter}
			onMouseLeave = {mouseLeave}
			onClick = {mouseClick}
		>
			<div style={{display: 'inline-block', verticalAlign: 'bottom'}}>
				<img src={slotImg} alt={slot} width='45px' style={{display: 'block'}} />
			</div>
			<div style={{display: 'inline-block', marginLeft: '5px'}}>
				<div style={{fontSize: '10px', color: color}}>
					{glob.toDisplayString(slot).toUpperCase()}
				</div>
				<div style={{color: color}}>{partName}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right'}}>
				<img src={manImg} width='35px' alt={manufacturer} 
					style={{display: 'block', opacity: '0.5'}} />
			</div>
		</div>
	);
}

const AssemblyGroup = ({header, slotIds, previewSetter}) => {
	const parts = useContext(BuilderPartsContext).parts;

	const slotNames = slotIds.map(id => glob.partSlots[id]);
	return(
		<div style={{marginBottom: '10px'}}>
			<div style={
				{fontSize: '10px', padding: '4px', border: 'solid 1px gray', 
					background: glob.paletteColor(3, 0.8)}
			}>
				{header}
			</div>
			{
				slotNames.map(
					slot => <AssemblyBox 
						partName = {parts[slot]['Name']}
						manufacturer = {parts[slot]['Manufacturer']}
						slot = {slot}
						previewSetter = {previewSetter}
						inactive = {slot === 'booster' && parts.legs['LegType'] === 'Tank'}
						key = {slot}
					/>
				)
			}
		</div>
	)
}



const ACAssembly = ({previewSetter}) => {
	const parts = useContext(BuilderPartsContext).parts;

	const headers = ['UNIT', 'FRAME', 'INNER', 'EXPANSION'];
	const ids = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10], [11]];

	return(
		<>
		<div style={
			{
				...glob.dottedBackgroundStyle(),
				...{display: 'flex', width: '99%', height: '45px', margin: '0px auto 5px auto', 
					border: 'solid 2px ' + glob.paletteColor(4)}
			}
		}>
			<div style={{margin: 'auto', fontSize: '20px'}}>ASSEMBLY</div>
		</div>
		{
			[0, 1, 2, 3].map(
				i => <AssemblyGroup 
					header={headers[i]}
					slotIds={ids[i]}
					previewSetter={previewSetter}
					key={i}
				/>
			)
		}
		<div style={{display: 'flex', width: '100%', height: '50px', 
			background: glob.paletteColor(3)}}>
			<button style={{margin: 'auto'}} onClick={() => copyBuildLink(parts)}>
				CREATE BUILD LINK
			</button>
		</div>			
		</>
	)
}

export default ACAssembly;