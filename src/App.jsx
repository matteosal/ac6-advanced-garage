import { useState } from 'react'

import AssemblyDisplay from "./Components/AssemblyDisplay.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";

function App() {
	const [explorerSlot, setExplorerSlot] = useState(null)
	return (
		<div>
			{
				explorerSlot === null ? 
					<AssemblyDisplay setExplorerSlot={setExplorerSlot} /> : 
					<PartsExplorer slot={explorerSlot} setSlot={setExplorerSlot} />
			}
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>