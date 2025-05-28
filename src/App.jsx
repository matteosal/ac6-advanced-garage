import { useState } from 'react';

import * as glob from './Misc/Globals.js';
import MainSwitcher from './Components/MainSwitcher.jsx';
import BuildComponent from './Components/BuildComponent.jsx';
import CompareBuildsComponent from './Components/CompareBuildsComponent.jsx';
import TablesComponent from './Components/TablesComponent.jsx';
import RicochetComponent from './Components/RicochetComponent.jsx';

/*************************************************************************************/

const backgroundStyle = {
	width: '100vw',
	height: '100vh',
	minWidth: '1600px',
	minHeight: '900px',
	background: 
		'repeating-linear-gradient(' +
			'rgb(0, 0, 0, 0) 0px,' +
			'rgb(0, 0, 0, 0) 3px,' +
			'rgb(127, 127, 127, 0.05) 3px,' +
			'rgb(127, 127, 127, 0.05) 6px' +
		'),' +
		'radial-gradient(' +
			'circle at center,' +
			glob.paletteColor(1) + ',' +
			glob.paletteColor(0) + 
		')',
	position: 'relative'
};
const containerStyle = {
	height: '100%',
	width: '1550px',
	margin: 'auto'
};


const SwitchedComponent = ({selectedSwitch}) => {
	switch (selectedSwitch) {
		case 'BUILD':
			return <BuildComponent />
		case 'COMPARE BUILDS':
			return <CompareBuildsComponent />
		case 'TABLES':
			return <TablesComponent />
		case 'RICOCHET CALCULATOR':
			return <RicochetComponent />
		default:
			window.alert('Internal error: invalid selected switch');
			return <></>
	}
}

const gameVersion = '1.9.0';

function App() {
	const [selectedSwitch, setSelectedSwitch] = useState('BUILD');

	return (
		<div style={backgroundStyle}>
		<div style={containerStyle}>
			<MainSwitcher selectedSwitch={selectedSwitch} setSelectedSwitch={setSelectedSwitch}/>
			<SwitchedComponent selectedSwitch={selectedSwitch} />
		</div>
		<div style={{color: 'gray', position: 'absolute', top: 10, left: 20}}>
			{'Site Version ' + process.env.REACT_APP_VERSION}
		</div>
		<div style={{color: 'gray', position: 'absolute', top: 30, left: 20}}>
			{'Game Version ' + gameVersion}
		</div>
		</div>
	);
}

export default App;
