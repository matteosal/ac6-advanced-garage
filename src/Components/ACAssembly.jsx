import { useState, useContext } from 'react';

import * as glob from '../Misc/Globals.js';
import {ACPartsContext} from "../Contexts/ACPartsContext.jsx";

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
	if(manufacturer != undefined)
		manImg = glob.manufacturerLogos[glob.toImageFileName(manufacturer)];
	else
		manImg = null;

	const background = highlighted ? glob.paletteColor(5) : glob.paletteColor(2, 0.5);
	const color = inactive ? 'gray' : 'inherit';

	return (
		<div
			style = {{border: 'solid 1px gray', padding: '5px', background: background}}
			onMouseEnter = {mouseEnter}
			onMouseLeave = {mouseLeave}
			onClick = {mouseClick}
		>
			<div style={{display: 'inline-block', verticalAlign: 'bottom'}}>
				<img src={slotImg} width='45px' style={{display: 'block'}} />
			</div>
			<div style={{display: 'inline-block', marginLeft: '5px'}}>
				<div style={{fontSize: '10px', color: color}}>
					{glob.toDisplayString(slot).toUpperCase()}
				</div>
				<div style={{color: color}}>{partName}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right'}}>
				<img src={manImg} width='35px' style={{display: 'block', opacity: '0.5'}} />
			</div>
		</div>
	);
}

const AssemblyGroup = ({header, slotIds, previewSetter}) => {
	const parts = useContext(ACPartsContext).current;

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

	const headers = ['UNIT', 'FRAME', 'INNER', 'EXPANSION'];
	const ids = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10], [11]];

	return(
		<div>
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
		</div>
	)
}

export default ACAssembly;