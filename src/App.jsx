import { useState } from 'react';

import * as glob from './Misc/Globals.js';
import MainSwitcher from './Components/MainSwitcher.jsx';
import BuildComponent from './Components/BuildComponent.jsx';
import CompareBuildsComponent from './Components/CompareBuildsComponent.jsx';

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
		default:
			window.log('Internal error: invalid selected switch');
			return <></>
	}
}

function App() {
	const [selectedSwitch, setSelectedSwitch] = useState('BUILD');

	return (
		<div style={backgroundStyle}>
		<div style={containerStyle}>
			<MainSwitcher selectedSwitch={selectedSwitch} setSelectedSwitch={setSelectedSwitch}/>
			<SwitchedComponent selectedSwitch={selectedSwitch} />
		</div>
		<div style={{color: 'gray', position: 'absolute', bottom: 15, left: 20}}>
			{'Version ' + process.env.REACT_APP_VERSION}
		</div>
		</div>
	);
}

export default App;
