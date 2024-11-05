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
				(part, pos) => <PartBox 
					name={part.Name}
					setExplorerSlot={setExplorerSlot}
					pos={pos}
					key={pos}
				/>
			)
		}
		</div>
	)
}

export default AssemblyDisplay