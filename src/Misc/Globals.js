import globPartsData from './PartsData.json';

const globNoneUnit = {
	"Name": "None",
	"Kind": "Unit",
	"RightArm": true,
	"LeftArm": true,
	"RightShoulder": true,
	"LeftShoulder": true,
	"Weight": 0,
	"ENLoad": 0
}
const globNoneBooster = {
	"Name": "None",
	"Kind": "Booster",
	"Weight": 0,
	"ENLoad": 0
}
const noneExpansion = {
	"Name": "None",
	"Kind": "Expansion"
}

globPartsData = globPartsData.concat([globNoneUnit, globNoneBooster, noneExpansion])
globPartsData = globPartsData.map((part, idx) => Object.assign(part, {ID: idx}))

const globPartSlots = ['RightArm', 'LeftArm', 'RightShoulder', 'LeftShoulder', 'Head', 'Core', 
	'Arms', 'Legs','Booster', 'FCS', 'Generator', 'Expansion']

export {globPartsData, globNoneUnit, globNoneBooster, globPartSlots}