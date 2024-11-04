import partsData from './PartsData.json';

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

partsData.unshift(noneUnit)
partsData.push(noneExpansion)
partsData = partsData.map((part, idx) => Object.assign(part, {ID: idx}))

const partSlots = ['Right Arm', 'Left Arm', 'Right Shoulder', 'Left Shoulder', 'Head', 'Core', 
  'Arms', 'Legs','Booster', 'FCS', 'Generator', 'Expansion']

export {partsData, partSlots}