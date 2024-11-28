import { useState } from 'react';

import * as glob from '../Misc/Globals.js';

const switcherButtonStyle = {
	margin: '0px 10px 0px 10px',
	padding: '10px'
}

const SwitcherButton = ({name, selected, setter}) => {
	const [highlighted, setHighlighted] = useState(false);

	const isSelected = name === selected;
	let style = switcherButtonStyle;
	if(isSelected)
		style = {...style, background: glob.paletteColor(5), 
			border: '2px solid ' + glob.paletteColor(5, 1, 1.5)};

	return(
		<button style={style} onClick={() => setter(name)}>
			{name}
		</button>
	)
}

const MainSwitcher = ({selectedSwitch, setSelectedSwitch}) => {
	return(
		<div style={
			{display: 'flex', justifyContent: 'center', paddingTop: '15px'}
		}>
			<SwitcherButton name={'BUILD'} selected={selectedSwitch} setter={setSelectedSwitch} />
			<SwitcherButton name={'COMPARE BUILDS'}
				selected={selectedSwitch} setter={setSelectedSwitch} />
		</div>
	)
}

export default MainSwitcher;