import { useState } from 'react';

import {globPartsData, globPartSlots} from '../Misc/Globals.js';

const PartBox = ({name, inactive, border, slot, setSelectedSlot, setter}) => {
	let style = {};
	if(border)
		style['border'] = 'solid';
	if(inactive)
		style['color'] = 'gray';
	return (
		<div
			style = {style}
			onMouseEnter = {() => 
				{
					if(inactive) {
						return
					} else {
						setSelectedSlot(slot)
					}
				}
			}
			onMouseLeave = {() => setSelectedSlot(null)}
			onClick = {() => setter(slot)}
		>
		{name}
		</div>
	);
}

const ACAssembly = ({setExplorerSlot, setPartsExplore, currentParts}) => {
	const [selectedSlot, setSelectedSlot] = useState(null);

	const openPartExplorer = slot => {
		setPartsExplore(true)
		setExplorerSlot(slot)
	}

	return(
		<div>
		{
			globPartSlots.map(
				slot => {
					let setter;
					// Deactivate booster slot if legs are tank
					if(slot === 'booster' && currentParts.legs['LegType'] === 'Tank') {
						setter = () => {};
					} else {
						setter = openPartExplorer;
					}
					return <PartBox 
						name = {currentParts[slot]['Name']}
						inactive = {slot === 'booster' && currentParts.legs['LegType'] === 'Tank'}
						border = {slot === selectedSlot}
						slot = {slot}
						setSelectedSlot = {setSelectedSlot}
						setter = {setter}
						key = {slot}
					/>
				}
			)
		}
		</div>
	)
}

export default ACAssembly;