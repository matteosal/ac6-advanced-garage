import { useState } from 'react'

import {globPartsData, globPartSlots} from '../Globals.js'

const PartReplacer = ({name, pos, setExplorerSlot}) => {
	return (
		<div onClick={() => setExplorerSlot(globPartSlots[pos])}>{name}</div>
	)
}

const AssemblyDisplay = ({setExplorerSlot, partIDs}) => {
	return(
		<>
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
		</>
	)
}

export default AssemblyDisplay