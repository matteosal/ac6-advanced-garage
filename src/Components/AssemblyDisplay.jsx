import { useState } from 'react'

import {globPartsData, globPartSlots} from '../Misc/Globals.js'

const PartBox = ({name, slot, setExplorerSlot}) => {
	return (
		<div onClick={() => setExplorerSlot(slot)}>{name}</div>
	)
}

const AssemblyDisplay = ({setExplorerSlot, parts}) => {
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
						name={parts[slot]['Name']}
						slot={slot}						
						setExplorerSlot={setter}
						key={slot}
					/>
				}
			)
		}
		</div>
	)
}

export default AssemblyDisplay