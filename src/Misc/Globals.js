import partsData from '../Assets/PartsData.json';

function importAll(r) {
    let images = {};
    r.keys().map(item => { images[item.replace('./', '')] = r(item); });
    return images;
}

const partImages = importAll(require.context('../Assets/Images/Parts', false, /\.png/));
const slotImages = importAll(require.context('../Assets/Images/Slots', false, /\.png/));
const unitIcons = importAll(require.context('../Assets/Images/UnitIcons', false, /\.png/));
const manufacturerLogos = importAll(require.context('../Assets/Images/Manufacturers', false, /\.png/));

function toImageFileName(name) {
	return name.replaceAll(' ', '_').replaceAll('/', '_') + '.png'
}

/***************************************************************************************/

const componentBackgroundStyle = {
	padding: '15px',
	background: 'rgb(36, 47, 69, 1)',
	backgroundImage: 'radial-gradient(rgb(80, 80, 80, 0.5) 1px, transparent 0)',
	backgroundSize: '3px 3px',
	backgroundPosition: '-1px -1px'
}

const color1 = 'rgb(51, 62, 84)';
const color2 = 'rgb(61, 72, 94)';

function stringInsert(str, insert, pos) {
	return str.substr(0, pos) + insert + str.substr(pos);
}

function addAlpha(color, alpha) {
 return stringInsert(color, ', ' + alpha, color.length - 1)
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

function scanStatsForRanges(kind, partEntry) {
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
		if(part['Name'] !== '(NOTHING)')
		Object.entries(part).map(entry => scanStatsForRanges(part['Kind'], entry))
	}
);

const partSlots = ['rightArm', 'leftArm', 'rightBack', 'leftBack', 'head', 'core', 
	'arms', 'legs','booster', 'fcs', 'generator', 'expansion'];

/***************************************************************************************/

function capitalizeFirstLetter(str) {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
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
			res = stringInsert(res, " ", pos + counter);
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
	/* STYLES */
	componentBackgroundStyle,
	color1,
	color2,
	addAlpha,
	/* PARTS */
	partsData,
	noneUnit,
	noneBooster,
	partStatsRanges,
	partSlots,
	/* UTILS */
	capitalizeFirstLetter,
	toDisplayString,
	round,
	total,
	mean
};