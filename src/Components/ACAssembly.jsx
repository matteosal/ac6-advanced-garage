import { useState } from 'react';

import * as glob from '../Misc/Globals.js';

const highlightColor = 'rgb(151, 173, 184)';

const PartBox = ({partName, slot, previewSetter, inactive}) => {
	const [highlighted, setHighlighted] = useState(false)

	let mouseEnter, mouseLeave, mouseClick;
	if(inactive) {
		mouseEnter = () => {};
		mouseLeave = () => {};
		mouseClick = () => {};
	} else {
		mouseEnter = () => setHighlighted(true);
		mouseLeave = () => setHighlighted(false);
		mouseClick = () => previewSetter(slot);		
	}

	const img = glob.slotImages[glob.toImageFileName(slot)];

	const background = highlighted ? highlightColor : glob.addAlpha(glob.color1, 0.5);
	const color = inactive ? 'gray' : 'inherit';

	return (
		<div
			style = {{border: 'solid 1px gray', padding: '5px', background: background}}
			onMouseEnter = {mouseEnter}
			onMouseLeave = {mouseLeave}
			onClick = {mouseClick}
		>
			<div style={{display: 'inline-block'}}>
				<img src={img} width='45px' />
			</div>
			<div style={{display: 'inline-block', marginLeft: '5px'}}>
				<div style={{fontSize: '10px', color: color}}>
					{glob.toDisplayString(slot).toUpperCase()}
				</div>
				<div style={{color: color}}>{partName}</div>
			</div>
		</div>
	);
}

const PartGroup = ({header, slotIds, parts, previewSetter}) => {
	const slotNames = slotIds.map(id => glob.partSlots[id]);
	return(
		<div style={{marginBottom: '20px'}}>
			<div style={
				{fontSize: '10px', padding: '5px', border: 'solid 1px gray', 
					background: glob.addAlpha(glob.color2, 0.8)}
			}>
				{header}
			</div>
			{
				slotNames.map(
					slot => <PartBox 
						partName = {parts[slot]['Name']}
						slot = {slot}
						previewSetter = {previewSetter}
						inactive = {slot === 'booster' && parts.legs['LegType'] === 'Tank'}
						key = {slot}
					/>
				)
			}
		</div>
	)
}



const ACAssembly = ({currentParts, previewSetter}) => {

	const headers = ['UNIT', 'FRAME', 'INNER', 'EXPANSION'];
	const ids = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10], [11]];

	return(
		<div>
		{
			[0, 1, 2, 3].map(
				i => <PartGroup 
					header={headers[i]}
					slotIds={ids[i]}
					parts={currentParts}
					previewSetter={previewSetter}
					key={i}
				/>
			)
		}
		</div>
	)
}

export default ACAssembly;