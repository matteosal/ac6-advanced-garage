import globPartsData from '../Assets/PartsData.json';

function importAll(r) {
    let images = {};
    r.keys().map(item => { images[item.replace('./', '')] = r(item); });
    return images;
}

const globPartImages = importAll(require.context('../Assets/Images/Parts', false, /\.png/));
const globSlotImages = importAll(require.context('../Assets/Images/Slots', false, /\.png/));
const globUnitIcons = importAll(require.context('../Assets/Images/UnitIcons', false, /\.png/));
const globManufacturerLogos = importAll(require.context('../Assets/Images/Manufacturers', false, /\.png/));

function toImageFileName(name) {
	return name.replaceAll(' ', '_').replaceAll('/', '_') + '.png'
}

/***************************************************************************************/

const noneUnit = {
	"Name": "(NOTHING)",
	"Kind": "Unit",
	"RightArm": true,
	"LeftArm": true,
	"RightBack": true,
	"LeftBack": true,
	"Weight": 0,
	"ENLoad": 0
};
const noneBooster = {
	"Name": "(NOTHING)",
	"Kind": "Booster",
	"Weight": 0,
	"ENLoad": 0
};
const noneExpansion = {
	"Name": "(NOTHING)",
	"Kind": "Expansion"
};

globPartsData = globPartsData.concat([noneUnit, noneBooster, noneExpansion]);
globPartsData = globPartsData.map((part, idx) => Object.assign(part, {ID: idx}));

// We do this so that these have the ID field. If the ordering of globPartsData changes
// these statements must be changed too
const globNoneUnit = globPartsData[globPartsData.length - 3];
const globNoneBooster = globPartsData[globPartsData.length - 2];

/***************************************************************************************/

// Stores min and max val for every stat, broken down by kinds
let globPartStatsRanges = {'Unit': {}, 'Head': {}, 'Core': {}, 'Arms': {}, 'Legs': {},
	'Booster': {}, 'FCS': {}, 'Generator': {}, 'Expansion': {}};

function scanStatsForRanges(kind, partEntry) {
	const [name, val] = partEntry;
	if(typeof val === 'number') {
		if(globPartStatsRanges[kind][name] === undefined) {
			globPartStatsRanges[kind][name] = [val, val];
			return;
		}

		if(val > globPartStatsRanges[kind][name][1])
			globPartStatsRanges[kind][name][1] = val;
		else if(val < globPartStatsRanges[kind][name][0])
			globPartStatsRanges[kind][name][0] = val;
	}
	return;
}

// Fills globPartStatsRanges
globPartsData.map(
	part => {
		if(part['Name'] !== '(NOTHING)')
		Object.entries(part).map(entry => scanStatsForRanges(part['Kind'], entry))
	}
);

/***************************************************************************************/

const globPartSlots = ['rightArm', 'leftArm', 'rightBack', 'leftBack', 'head', 'core', 
	'arms', 'legs','booster', 'fcs', 'generator', 'expansion'];

/***************************************************************************************/

function capitalizeFirstLetter(str) {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function insertCharacter(str, char, pos) {
	return str.substr(0, pos) + char + str.substr(pos);
}

const displayStringTable = {'rightArm': 'R-ARM UNIT', 'leftArm': 'L-ARM UNIT', 
	'rightBack': 'R-BACK UNIT', 'leftBack': 'L-BACK UNIT', 'fcs': 'FCS', 
	'QBENConsumption': 'QB EN Consumption', 'ABENConsumption': 'AB EN Consumption'};

function toDisplayString(str) {
	const fromTable = displayStringTable[str];
	if(fromTable != undefined)
		return fromTable;

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
			res = insertCharacter(res, " ", pos + counter);
			counter++;
		}
	)

	return capitalizeFirstLetter(res);
}

/***************************************************************************************/

function round(val, roundTarget = 1) {
	const roundFactor = 1 / roundTarget;
	return Math.round(val * roundFactor) / roundFactor;
}

/***************************************************************************************/

export {
	toImageFileName,
	globPartImages,
	globSlotImages,
	globUnitIcons,
	globManufacturerLogos,
	globPartsData,
	globNoneUnit,
	globNoneBooster,
	globPartStatsRanges,
	globPartSlots,
	capitalizeFirstLetter,
	toDisplayString,
	round
};