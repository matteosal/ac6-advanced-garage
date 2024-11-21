import partsData from '../Assets/PartsData.json';

import { toast, Slide } from 'react-toastify';

function importAll(r) {
	let images = {};
	r.keys().map(item => { images[item.replace('./', '')] = r(item); });
	return images;
}

const partImages = importAll(require.context('../Assets/Images/Parts', false, /\.png/));
const slotImages = importAll(require.context('../Assets/Images/Slots', false, /\.png/));
const unitIcons = importAll(require.context('../Assets/Images/UnitIcons', false, /\.png/));
const manufacturerLogos = importAll(
	require.context('../Assets/Images/Manufacturers', false, /\.png/)
);
const infoIcon = require("../Assets/Images/info_icon.png");
const sortIcons = {
	ascend: require("../Assets/Images/sort_ascending.png"),
	descend: require("../Assets/Images/sort_descending.png")
};
const expandIcon = require("../Assets/Images/expand_icon.png");

function toImageFileName(name) {
	return name.replaceAll(' ', '_').replaceAll('/', '_') + '.png'
}

/***************************************************************************************/

// Sorted by brightness. This is only used for larger UI elements, smaller things can define
// their colors locally
const palette = [
	[13, 20, 30], [36, 53, 73], [51, 62, 84], [61, 72, 94], [67, 84, 104], [151, 173, 184]
];

function paletteColor(id, alpha = 1, brightnessAdj = 1) {
	const stringVals = palette[id].map(val => (val * brightnessAdj).toString());
	const substr = stringVals.reduce(
		(acc, val) => {
			return acc.concat(val, ', ')
		}, 
		''
	);
	return 'rgb(' + substr + alpha.toString() + ')'
}

function dottedBackgroundStyle(background = paletteColor(1)) {
	return ({
		background: background,
		backgroundImage: 'radial-gradient(rgb(80, 80, 80, 0.5) 1px, transparent 0)',
		backgroundSize: '3px 3px',
		backgroundPosition: '-1px -1px'
	})
}

function tableRowBackground(pos) {
	if(pos % 2)
		return paletteColor(4, 0.5, 0.95);
	else
		return paletteColor(2, 0.5);
}

/***************************************************************************************/

const noneUnitPre = {
	"Name": "(NOTHING)",
	"Kind": "Unit",
	"RightArm": true,
	"LeftArm": true,
	"RightBack": true,
	"LeftBack": true,
	"Weight": 0,
	"ENLoad": 0
};
const noneBoosterPre = {
	"Name": "(NOTHING)",
	"Kind": "Booster",
	"Weight": 0,
	"ENLoad": 0
};
const noneExpansionPre = {
	"Name": "(NOTHING)",
	"Kind": "Expansion"
};

partsData = partsData.concat([noneUnitPre, noneBoosterPre, noneExpansionPre]);
partsData = partsData.map((part, idx) => {return {...part, ...{ID: idx}}});

// We do this so that these have the ID field. If the ordering of partsData changes
// these statements must be changed too
const noneUnit = partsData[partsData.length - 3];
const noneBooster = partsData[partsData.length - 2];

/***************************************************************************************/

// Stores min and max val for every stat, broken down by kinds
let partStatsRanges = {'Unit': {}, 'Head': {}, 'Core': {}, 'Arms': {}, 'Legs': {},
	'Booster': {}, 'FCS': {}, 'Generator': {}, 'Expansion': {}};

function updateRange(kind, partEntry) {
	const [name, val] = partEntry;
	if(typeof val === 'number') {
		if(partStatsRanges[kind][name] === undefined) {
			partStatsRanges[kind][name] = [val, val];
			return;
		}

		if(val > partStatsRanges[kind][name][1])
			partStatsRanges[kind][name][1] = val;
		else if(val < partStatsRanges[kind][name][0])
			partStatsRanges[kind][name][0] = val;
	}
	return;
}

// Fills partStatsRanges
partsData.map(
	part => {
		Object.entries(part).map(entry => updateRange(part['Kind'], entry))
	}
);

function minMaxAcross(kinds, prop) {
	return kinds.reduce(
			(acc, kind) => {
				const minMax = partStatsRanges[kind][prop];
				return [acc[0] + minMax[0], acc[1] + minMax[1]]	
			},
			[0, 0]
		)	
}

let acStatsRanges = {};
// This is not 100% correct because we are taking the MinMax across all units for all
// unit slots, but every slot has its own set of allowed units
acStatsRanges['CurrentLoad'] = minMaxAcross(
	['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Booster', 'FCS', 'Generator'],
	'Weight'
);
acStatsRanges['CurrentArmsLoad'] = minMaxAcross(['Unit', 'Unit'], 'Weight');
acStatsRanges['CurrentENLoad'] = minMaxAcross(
	['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Legs', 'Booster', 'FCS'],
	'ENLoad'
);

const partSlots = ['rightArm', 'leftArm', 'rightBack', 'leftBack', 'head', 'core', 
	'arms', 'legs','booster', 'fcs', 'generator', 'expansion'];

const pairedUnitSlots = {'rightArm': 'rightBack', 'rightBack': 'rightArm', 
	'leftArm': 'leftBack', 'leftBack': 'leftArm'};

const hidddenPartStats = ['Name', 'Kind', 'Manufacturer', 'Description', 'AttackType', 
	'WeaponType', 'ReloadType', 'AdditionalEffect', 'LegType', 'GeneratorType', 'RightArm', 
	'LeftArm', 'RightBack', 'LeftBack','ID'];

function computePartsForSlot(slot, backSubslot) {
	let slotFilterFunc;
	const slotCapitalized = slot == 'fcs' ? 'FCS' : capitalizeFirstLetter(slot);

	if(['rightArm', 'leftArm'].includes(slot)) {
		slotFilterFunc = part => (part.Kind === 'Unit' && part[slotCapitalized]);
	} else 
	if(['rightBack', 'leftBack'].includes(slot)) {
		const pairedSlotCapitalized = capitalizeFirstLetter(pairedUnitSlots[slot]);
		if(backSubslot === 0)
			// Actual back units. The convoluted filter indicates something should be refactored,
			// maybe the parts data
			slotFilterFunc = part => (
				part.Kind === 'Unit' && 
				(
					(part[slotCapitalized] && !part[pairedSlotCapitalized]) || 
					part['ID'] === noneUnit['ID']
				)
			);
		else
			// Arm units for back slot
			slotFilterFunc = part => (
				part.Kind === 'Unit' && part[slotCapitalized] && part[pairedSlotCapitalized]
			);
	} else if(slot === 'booster') {
		// The None booster exists because of the tank legs but the user should not be allowed
		// to set it manually
		slotFilterFunc = part => 
			(part.Kind === slotCapitalized && part['ID'] != noneBooster['ID']);
	} else {
		slotFilterFunc = part => (part.Kind === slotCapitalized);
	}
	return partsData.filter(slotFilterFunc);	
}

// Precompute the list of parts that can go into each slot
let slotParts = {};
partSlots.map(
	(slot) => {
		if(!['leftBack', 'rightBack'].includes(slot))
			slotParts[slot] = computePartsForSlot(slot, 0); // 2nd arg is irrelevant
		else // This looks like shit
			slotParts[slot] = {0: computePartsForSlot(slot, 0), 1: computePartsForSlot(slot, 1)}
	}
)

function getPartsForSlot(slot, backSubslot) {
	if(!['leftBack', 'rightBack'].includes(slot))
		return slotParts[slot];
	else
		return slotParts[slot][backSubslot];
}

/***************************************************************************************/

function capitalizeFirstLetter(str) {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

const displayStringTable = {'rightArm': 'R-ARM UNIT', 'leftArm': 'L-ARM UNIT', 
	'rightBack': 'R-BACK UNIT', 'leftBack': 'L-BACK UNIT', 'fcs': 'FCS', 
	'QBENConsumption': 'QB EN Consumption', 'ABENConsumption': 'AB EN Consumption',
	'EffectiveAPKinetic': 'Effective AP (Kinetic)', 
	'EffectiveAPEnergy': 'Effective AP (Energy)',
	'EffectiveAPExplosive': 'Effective AP (Explosive)',
	'EffectiveAPAvg': 'Effective AP (Avg.)', 'QBENRechargeTime': 'QB EN Recharge Time',
	'ENRechargeDelayRedline': 'EN Recharge Delay (Redline)',
	'FullRechargeTimeRedline': 'Full Recharge Time (Redline)'};

function stringInsert(str, insert, pos) {
	return str.substr(0, pos) + insert + str.substr(pos);
}

function splitCamelCase(str) {
	let upperCasePos = [];
	for(var i = 1; i < str.length - 1; i++) {
		if(
			str[i].match(/[A-Z]/) != null && 
			(str[i-1].match(/[A-Z]/) === null || str[i+1].match(/[A-Z]/) === null)
		) {
			upperCasePos.push(i);
		}
	}

	let res = str;
	let counter = 0;
	upperCasePos.forEach(
		pos => {
			res = stringInsert(res, " ", pos + counter);
			counter++;
		}
	)

	return res;
}

function toDisplayString(str) {
	const fromTable = displayStringTable[str];
	if(fromTable != undefined)
		return fromTable;

	const res = splitCamelCase(str);

	return capitalizeFirstLetter(res);
}

const boxCharacter = '\u25a0';

function notify(msg) {
	return toast(msg, 
		{style: {background: paletteColor(0)}, type:'info', position: "top-right", 
			autoClose: 3000, transition: Slide}
	)
}

/***************************************************************************************/

function round(val, roundTarget = 1) {
	if(val === null)
		return val;
	const roundFactor = 1 / roundTarget;
	return Math.round(val * roundFactor) / roundFactor;
}

function total(list) {
	return list.reduce((val, acc) => val + acc);
}

function mean(list) {
	if(list.length === 0)
		return undefined;
	return total(list) / list.length
}


/***************************************************************************************/

export {
	/* IMAGES */
	toImageFileName,
	partImages,
	slotImages,
	unitIcons,
	manufacturerLogos,
	infoIcon,
	sortIcons,
	expandIcon,
	/* STYLES */
	paletteColor,
	dottedBackgroundStyle,
	tableRowBackground,
	/* PARTS */
	partsData,
	noneUnit,
	noneBooster,
	partStatsRanges,
	acStatsRanges,
	partSlots,
	pairedUnitSlots,
	hidddenPartStats,
	getPartsForSlot,
	/* UTILS */
	boxCharacter,
	notify,
	splitCamelCase,
	capitalizeFirstLetter,
	toDisplayString,
	round,
	total,
	mean
};