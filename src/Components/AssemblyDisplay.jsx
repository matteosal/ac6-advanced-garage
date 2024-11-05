import { useState } from 'react'

import {globPartsData, globPartSlots} from '../Misc/Globals.js'

const PartBox = ({name, pos, setExplorerSlot}) => {
	return (
		<div onClick={() => setExplorerSlot(globPartSlots[pos])}>{name}</div>
	)
}

const AssemblyDisplay = ({setExplorerSlot, parts}) => {
	return(
		<div style={{display : 'inline-block', verticalAlign: 'top'}}>
		{
			parts.map(
				(part, pos) => {
					let setter
					// Deactivate booster slot if legs are tank
					if(pos === 8 && parts[7]['LegType'] === 'Tank') {
						setter = () => {}
					} else {
						setter = setExplorerSlot
					}
					return <PartBox 
						name={part.Name}
						setExplorerSlot={setter}
						pos={pos}
						key={pos}
					/>
				}
			)
		}
		</div>
	)
}

export default AssemblyDisplay