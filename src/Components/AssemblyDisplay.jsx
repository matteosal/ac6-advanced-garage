import { useState } from 'react'

import {partsData, partSlots} from '../Globals.js'

const PartReplacer = ({name, pos, explorerSlotSetter}) => {
	return (
		<div onClick={() => explorerSlotSetter(partSlots[pos])}>{name}</div>
	)
}

const starterACPartNames = [
	'RF-024 TURNER',
	'HI-32: BU-TT/A',
	'BML-G1/P20MLT-04',
	'No Unit',
	'HC-2000 FINDER EYE',
	'CC-2000 ORBITER',
	'AC-2000 TOOL ARM',
	'2C-2000 CRAWLER',
	'BST-G1/P10',
	'FCS-G1/P01',
	'AG-J-098 JOSO',
	'No Expansion'
]
const starterACPartIDs = starterACPartNames.map(
	name => partsData.find(part => part.Name === name).ID
)

const AssemblyDisplay = ({explorerSlotSetter}) => {
	const [partIDs, setPartIDs] = useState(starterACPartIDs)

	return(
		<>
		{
			partIDs.map(
				(id, pos) => <PartReplacer 
					name={partsData[id].Name}
					explorerSlotSetter={explorerSlotSetter}
					pos={pos}
					key={pos}
				/>
			)
		}
		</>
	)
}

export default AssemblyDisplay