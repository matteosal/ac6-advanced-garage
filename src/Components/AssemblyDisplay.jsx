import { useState } from 'react'

import {globPartsData, globPartSlots} from '../Misc/Globals.js'

const PartReplacer = ({name, pos, setExplorerSlot}) => {
	return (
		<div onClick={() => setExplorerSlot(globPartSlots[pos])}>{name}</div>
	)
}

const AssemblyDisplay = ({setExplorerSlot, partIDs}) => {
	return(
		<div style={{display : 'inline-block', verticalAlign: 'top'}}>
		{
			partIDs.map(
				(id, pos) => <PartReplacer 
					name={globPartsData[id].Name}
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