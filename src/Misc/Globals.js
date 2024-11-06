import globPartsData from './PartsData.json';

const noneUnit = {
	"Name": "None",
	"Kind": "Unit",
	"RightArm": true,
	"LeftArm": true,
	"RightShoulder": true,
	"LeftShoulder": true,
	"Weight": 0,
	"ENLoad": 0
}
const noneBooster = {
	"Name": "None",
	"Kind": "Booster",
	"Weight": 0,
	"ENLoad": 0
}
const noneExpansion = {
	"Name": "None",
	"Kind": "Expansion"
}

globPartsData = globPartsData.concat([noneUnit, noneBooster, noneExpansion])
globPartsData = globPartsData.map((part, idx) => Object.assign(part, {ID: idx}))

// We do this so that these have the ID field. If the ordering of globPartsData changes
// these statements must be changed too
const globNoneUnit = globPartsData[globPartsData.length - 3]
const globNoneBooster = globPartsData[globPartsData.length - 2]

const globPartSlots = ['rightArm', 'leftArm', 'rightShoulder', 'leftShoulder', 'head', 'core', 
	'arms', 'legs','booster', 'fcs', 'generator', 'expansion']

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function round(val, roundTarget = 1) {
	const roundFactor = 1 / roundTarget
	return Math.round(val * roundFactor) / roundFactor
}

export {globPartsData, globNoneUnit, globNoneBooster, globPartSlots, capitalizeFirstLetter,
	round}