import partsData from './PartsData.json';

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

partsData.unshift(noneUnit)
partsData = partsData.map((part, idx) => Object.assign(part, {ID: idx}))

export default partsData