import { useState } from 'react';

import {globPartsData, globPartSlots} from '../Misc/Globals.js';

const PartBox = ({partName, slot, previewSetter, inactive}) => {
	const [border, setBorder] = useState(false)

	let style = {};
	if(border)
		style['border'] = 'solid';
	if(inactive)
		style['color'] = 'gray';

	let mouseEnter, mouseLeave, mouseClick;
	if(inactive) {
		mouseEnter = () => {};
		mouseLeave = () => {};
		mouseClick = () => {};
	} else {
		mouseEnter = () => setBorder(true);
		mouseLeave = () => setBorder(false);
		mouseClick = () => previewSetter(slot);		
	}

	return (
		<div
			style = {style}
			onMouseEnter = {mouseEnter}
			onMouseLeave = {mouseLeave}
			onClick = {mouseClick}
		>
		{partName}
		</div>
	);
}

const ACAssembly = ({previewSetter, currentParts}) => {
	return(
		<div>
		{
			globPartSlots.map(
				slot => <PartBox 
					partName = {currentParts[slot]['Name']}
					slot = {slot}
					previewSetter = {previewSetter}
					inactive = {slot === 'booster' && currentParts.legs['LegType'] === 'Tank'}
					key = {slot}
				/>
			)
		}
		</div>
	)
}

export default ACAssembly;