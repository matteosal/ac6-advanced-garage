import globPartsData from './PartsData.json';

const noneUnit = {
	"Name": "No Unit",
	"Kind": "Unit",
	"RightArm": true,
	"LeftArm": true,
	"RightShoulder": true,
	"LeftShoulder": true,
	"Weight": 0,
	"ENLoad": 0
}
const noneExpansion = {
	"Name": "No Expansion",
	"Kind": "Expansion"
}

globPartsData.unshift(noneUnit)
globPartsData.push(noneExpansion)
globPartsData = globPartsData.map((part, idx) => Object.assign(part, {ID: idx}))

const globPartSlots = ['Right Arm', 'Left Arm', 'Right Shoulder', 'Left Shoulder', 'Head', 'Core', 
	'Arms', 'Legs','Booster', 'FCS', 'Generator', 'Expansion']

export {globPartsData, globPartSlots}