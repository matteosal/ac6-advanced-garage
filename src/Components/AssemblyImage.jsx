import { useContext } from 'react';

import * as glob from '../Misc/Globals.js';

import {BuilderStateContext} from '../Contexts/BuilderStateContext.jsx'

/*********************************************************************************/

const partImgsAspectRatio = 602/307.;

// top and left values refer to shifts given to the *center* of the image,
// they are translated to shifts given to the left and top border respectively
const srcBaseImgDirectives = {
	armsr: {width: 90 * 1.36,  top: 125, left: 460, zIndex: 5},
	head:  {width: 120 * 1.36, top: 35,  left: 320, zIndex: 4},
	core:  {width: 220 * 1.36, top: 150, left: 320, zIndex: 3},
	legs:  {width: 500 * 1.36, top: 380, left: 320, zIndex: 2},
	armsl: {width: 110 * 1.36, top: 115, left: 180, zIndex: 1}
};
const partDirectiveCorrections = {
	// HEAD
	'KASUAR/44Z': {width: 1.15},
	'NACHTREIHER/44E': {width: 0.9},
	'VP-44D': {width: 1.2},
	'AH-J-124 BASHO': {width: 0.85},
	'AH-J-124/RC JAILBREAK': {width: 0.85},
	'LAMMERGEIER/44F': {width: 0.85},
	'HC-2000 FINDER EYE': {width: 0.85},
	'IA-C01H: EPHEMERA': {width: 1.25},
	'IB-C03H: HAL 826': {width: 1.2},
	'20-082 MIND BETA': {width: 0.8},
	'HC-3000 WRECKER': {width: 0.85},
	'HS-5000 APPETIZER': {width: 0.9},
	'DF-HD-08 TIAN-QIANG': {width: 0.8},
	'EL-PH-00 ALBA': {width: 0.9},
	//CORE
	'DF-BD-08 TIAN-QIANG': {width: 1.1},
	'IB-C03C: HAL 826': {width: 1.25, left: 20},
	'CC-3000 WRECKER': {width: 1.2},
	'CC-2000 ORBITER': {width: 1.25, top: -10},
	// ARMS
	'AS-5000 SALAD RIGHT': {top: 10},
	// LEGS	
	'EL-TL-11 FORTALEZA': {width: 0.75, top: -25},
	'VE-42B': {width: 1, top: -50},
	'LG-022T BORNEMISSZA': {top: -25}
}

function makeDirective(base, partName) {
	const corrections = partDirectiveCorrections[partName] || {width: 1, top: 0, left: 0};
	const wCorr = corrections.width || 1;
	const tCorr = corrections.top || 0;
	const lCorr = corrections.left || 0;
	const width = base.width.toString() * wCorr;
	return {
		width: width + 'px', 
		left: base.left - width / 2 + lCorr,
		top: base.top - width / partImgsAspectRatio / 2 + tCorr,
		zIndex: base.zIndex,
		transform: base.transform
	}
}

function getImageDirectives(parts) {
	const directives = {};
	Object.entries(parts).map(
		([slot, part]) => {
			const name = part['Name'];
			if(slot === 'arms') {
				directives['armsl'] = makeDirective(
					srcBaseImgDirectives['armsl'],
					name + ' LEFT'
				);
				directives['armsr'] = makeDirective(
					srcBaseImgDirectives['armsr'],
					name + ' RIGHT'
				);
				return null;
			}
			const base = srcBaseImgDirectives[slot];
			if(!base)
				return null;
			directives[slot] = makeDirective(base, name);
			return null
		}
	)
	return directives;
}

/*********************************************************************************/

const AssemblyImage = () => {
	const parts = useContext(BuilderStateContext).parts;
	const imgsEntries = [];
	Object.keys(parts).map(slot => {
		if(slot !== 'arms')
			imgsEntries.push(
				[slot, glob.partImages[glob.toImageFileName(parts[slot]['Name'])]]
			)
		else {
			const name = parts[slot]['Name'];
			imgsEntries.push(
				['armsl', glob.splitArmsImages[glob.toImageFileName(name + '_L')]]
			);
			imgsEntries.push(
				['armsr', glob.splitArmsImages[glob.toImageFileName(name + '_R')]]
			);
		}
		return null;
	});
	const imgs = Object.fromEntries(imgsEntries);
	const imgDirectives = getImageDirectives(parts);
	return(
		<div style={{position: 'relative'}}>
		{
			Object.keys(imgDirectives).map(
				slot => <img 
					style={{position: 'absolute', ...imgDirectives[slot]}}
					src={imgs[slot]}
					alt={slot}
					key={slot}
				/>
			)
		}
		</div>
	)
}

export default AssemblyImage;