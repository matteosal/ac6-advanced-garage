import { useContext } from 'react';

import * as glob from '../Misc/Globals.js';

import {BuilderStateContext} from '../Contexts/BuilderStateContext.jsx'

const partImgsAspectRatio = 347/179.;

// top and left values refer to shifts given to the *center* of the image,
// they are translated to shifts given to the left and top border respectively
const srcImgDirectives = {
	head: {width: 150, top: 150, left: 320},
	core: {width: 225, top: 250, left: 320},
	legs: {width: 400, top: 430, left: 320}
};
const imgDirectives = Object.fromEntries(
	Object.entries(srcImgDirectives).map(
		([slot, dir]) => [
			slot,
			{
				width: dir.width.toString() + 'px', 
				left: dir.left - dir.width / 2,
				top: dir.top - dir.width / partImgsAspectRatio / 2 
			}
		]
	)
);

const AssemblyImage = () => {
	const parts = useContext(BuilderStateContext).parts;
	const imgs = Object.fromEntries(
		Object.keys(parts).map(slot => 
			[slot, glob.partImages[glob.toImageFileName(parts[slot]['Name'])]]
		)
	);
	return(
		<div style={{position: 'relative', width: '100%', height: '631px'}}>
		{
			Object.keys(imgDirectives).map(
				slot => <img 
					style={{position: 'absolute', width: imgDirectives[slot].width, 
						top: imgDirectives[slot].top, left: imgDirectives[slot].left}}
					src={imgs[slot]}
				/>
			)
		}
		</div>
	)
}

export default AssemblyImage;