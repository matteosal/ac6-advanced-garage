import { useState } from 'react'

import {globPartsData, globPartSlots} from './Misc/Globals.js'
import AssemblyDisplay from "./Components/AssemblyDisplay.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";
import StatsDisplay from "./Components/StatsDisplay.jsx";

const starterACPartNames = [
	'RF-024 TURNER',
	'HI-32: BU-TT/A',
	'BML-G1/P20MLT-04',
	'None',
	'HC-2000 FINDER EYE',
	'CC-2000 ORBITER',
	'AC-2000 TOOL ARM',
	'2C-2000 CRAWLER',
	'BST-G1/P10',
	'FCS-G1/P01',
	'AG-J-098 JOSO',
	'None'
]
const assemblyKinds = ['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Legs',
	'Booster', 'FCS', 'Generator', 'Expansion']
const starterACPartIDs = starterACPartNames.map(
	(name, pos) => globPartsData.find(
		part => part.Kind === assemblyKinds[pos] && part.Name === name
	).ID
)

function App() {
	const [assemblyParts, setAssemblyParts] = useState(starterACPartIDs)
	const [explorerSlot, setExplorerSlot] = useState(null)

	return (
		<div>
			{
				explorerSlot === null ? 
					<AssemblyDisplay partIDs={assemblyParts} setExplorerSlot={setExplorerSlot} /> : 
					<PartsExplorer 
						slot={explorerSlot}
						setSlot={setExplorerSlot}
						assemblyParts={assemblyParts}
						setAssemblyParts={setAssemblyParts}
					/>
			}
			<StatsDisplay assemblyParts={assemblyParts} />
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>