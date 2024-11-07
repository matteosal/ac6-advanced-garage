import globPartsData from './PartsData.json';

/***************************************************************************************/

const noneUnit = {
	"Name": "None",
	"Kind": "Unit",
	"RightArm": true,
	"LeftArm": true,
	"RightShoulder": true,
	"LeftShoulder": true,
	"Weight": 0,
	"ENLoad": 0
};
const noneBooster = {
	"Name": "None",
	"Kind": "Booster",
	"Weight": 0,
	"ENLoad": 0
};
const noneExpansion = {
	"Name": "None",
	"Kind": "Expansion"
};

globPartsData = globPartsData.concat([noneUnit, noneBooster, noneExpansion]);
globPartsData = globPartsData.map((part, idx) => Object.assign(part, {ID: idx}));

// We do this so that these have the ID field. If the ordering of globPartsData changes
// these statements must be changed too
const globNoneUnit = globPartsData[globPartsData.length - 3];
const globNoneBooster = globPartsData[globPartsData.length - 2];

const globPartSlots = ['rightArm', 'leftArm', 'rightShoulder', 'leftShoulder', 'head', 'core', 
	'arms', 'legs','booster', 'fcs', 'generator', 'expansion'];

/***************************************************************************************/

function capitalizeFirstLetter(str) {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function insertCharacter(str, char, pos) {
	return str.substr(0, pos) + char + str.substr(pos);
}

const displayStringTable = {'fcs': 'FCS', 'QBENConsumption': 'QB EN Consumption',
	'ABENConsumption': 'AB EN Consumption'};

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
	globPartsData,
	globNoneUnit,
	globNoneBooster,
	globPartSlots,
	capitalizeFirstLetter,
	toDisplayString,
	round
};