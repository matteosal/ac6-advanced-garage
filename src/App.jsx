import { useState } from 'react'

import AssemblyDisplay from "./Components/AssemblyDisplay.jsx";
import PartsExplorer from "./Components/PartsExplorer.jsx";

function App() {
  const [selectedSlot, setSelectedSlot] = useState(null)
	return (
		<div>
			{
				selectedSlot === null ? 
					<AssemblyDisplay explorerSlotSetter={setSelectedSlot} /> : 
					<PartsExplorer selectedSlot={selectedSlot} slotSetter={setSelectedSlot} />
			}
		</div>
	)
}

export default App;

// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>