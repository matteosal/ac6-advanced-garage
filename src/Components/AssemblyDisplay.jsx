import { useState } from 'react'

import {globPartsData, globPartSlots} from '../Misc/Globals.js'

const PartBox = ({name, inactive, border, slot, setSelectedSlot, setExplorerSlot}) => {
	let style = {}
	if(border)
		style['border'] = 'solid'
	if(inactive)
		style['color'] = 'gray'
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
			onClick = {() => setExplorerSlot(slot)}
		>
		{name}
		</div>
	)
}

const AssemblyDisplay = ({setExplorerSlot, parts}) => {
	const [selectedSlot, setSelectedSlot] = useState(null)

	return(
		<div style={{display : 'inline-block', verticalAlign: 'top'}}>
		{
			globPartSlots.map(
				slot => {
					let setter
					// Deactivate booster slot if legs are tank
					if(slot === 'booster' && parts.legs['LegType'] === 'Tank') {
						setter = () => {}
					} else {
						setter = setExplorerSlot
					}
					return <PartBox 
						name = {parts[slot]['Name']}
						inactive = {slot === 'booster' && parts.legs['LegType'] === 'Tank'}
						border = {slot === selectedSlot}
						slot = {slot}
						setSelectedSlot = {setSelectedSlot}
						setExplorerSlot = {setter}
						key = {slot}
					/>
				}
			)
		}
		</div>
	)
}

export default AssemblyDisplay