import rawPartsData from '../Assets/PartsData.json';

import * as dataFuncs from './DataFuncs.js'

import { toast, Slide } from 'react-toastify';

function importAll(r) {
	let images = {};
	r.keys().map(item => {
		images[item.replace('./', '')] = r(item);
		return null;
	});
	return images;
}

export const partImages = importAll(require.context('../Assets/Images/Parts', false, /\.png/));
export const splitArmsImages = importAll(require.context('../Assets/Images/SplitArms', false, /\.png/));
export const slotImages = importAll(require.context('../Assets/Images/Slots', false, /\.png/));
export const unitIcons = importAll(require.context('../Assets/Images/UnitIcons', false, /\.png/));
export const manufacturerLogos = importAll(
	require.context('../Assets/Images/Manufacturers', false, /\.png/)
);
export const infoIcon = require("../Assets/Images/info_icon.png");
export const sortIcons = {
	ascend: require("../Assets/Images/sort_ascending.png"),
	descend: require("../Assets/Images/sort_descending.png")
};
export const expandIcon = require("../Assets/Images/expand_icon.png");

export function toImageFileName(name) {
	return name.replaceAll(' ', '_').replaceAll('/', '_').replaceAll(':', '') + '.png'
}

/***************************************************************************************/

// Sorted by brightness. This is only used for larger UI elements, smaller things can define
// their colors locally
const palette = [
	[13, 20, 30], [36, 53, 73], [51, 62, 84], [61, 72, 94], [67, 84, 104], [151, 173, 184]
];

export function paletteColor(id, alpha = 1, brightnessAdj = 1) {
	const stringVals = palette[id].map(val => (val * brightnessAdj).toString());
	const substr = stringVals.reduce(
		(acc, val) => {
			return acc.concat(val, ', ')
		}, 
		''
	);
	return 'rgb(' + substr + alpha.toString() + ')'
}

export function dottedBackgroundStyle(background = paletteColor(1)) {
	return ({
		background: background,
		backgroundImage: 'radial-gradient(rgb(80, 80, 80, 0.5) 1px, transparent 0)',
		backgroundSize: '3px 3px',
		backgroundPosition: '-1px -1px'
	})
}

export function tableRowBackground(pos) {
	if(pos % 2)
		return paletteColor(4, 0.5, 0.95);
	else
		return paletteColor(2, 0.5);
}

/***************************************************************************************/

export const partsData = dataFuncs.postprocessData(rawPartsData);
export const normalizedPartsData = {
	'Weight': dataFuncs.normalizeData(partsData, 'Weight'),
	'ENLoad': dataFuncs.normalizeData(partsData, 'ENLoad')
}

export const noneUnit = partsData.find(p => p['Name'] === '(NOTHING)' && p['Kind'] === 'Unit');
export const noneBooster = partsData.find(
	p => p['Name'] === '(NOTHING)' && p['Kind'] === 'Booster'
);

// Used when removing tank legs
export const defaultBooster = partsData.find(p => p['Name'] === 'BST-G1/P10');

// Stores min and max val for every stat, broken down by kinds
export const partStatsRanges = dataFuncs.getPartStatsRanges(partsData);
export const normalizedStatsRanges = {
	'Weight': dataFuncs.getPartStatsRanges(normalizedPartsData['Weight']),
	'ENLoad': dataFuncs.getPartStatsRanges(normalizedPartsData['ENLoad'])
}

// Stores min and max for CurrentLoad, CurrentArmsLoad and CurrentENLoad
export const acStatsRanges = dataFuncs.getACStatRanges(partStatsRanges)

export const partSlots = ['rightArm', 'leftArm', 'rightBack', 'leftBack', 'head', 'core', 
	'arms', 'legs','booster', 'fcs', 'generator', 'expansion'];

export const pairedUnitSlots = {'rightArm': 'rightBack', 'rightBack': 'rightArm', 
	'leftArm': 'leftBack', 'leftBack': 'leftArm'};

// Precompute the list of parts that can go into each slot
let rawPartsIdsForSlot = 
	dataFuncs.getRawPartIdsForSlot(partSlots, partsData, pairedUnitSlots);

export function getPartIdsForSlot(slot, backSubslot) {
	if(!['leftBack', 'rightBack'].includes(slot))
		return rawPartsIdsForSlot[slot];
	else
		return rawPartsIdsForSlot[slot][backSubslot];
}

export const partStatGroups = {
	'Unit': [
		[
			'AttackPower', 'Impact', 'AccumulativeImpact', 'Damage/s', 'Impact/s',
			'AccumulativeImpact/s', 'Damage/sInclReload', 'Impact/sInclReload', 
			'AccImpact/sInclReload', 'ComboDamage', 'ComboImpact', 'ComboAccumulativeImpact', 
			'DirectAttackPower', 'DirectDamage/s', 'ComboDirectDamage', 'BlastRadius', 
			'ATKHeatBuildup', 'ConsecutiveHits', 'DamageMitigation', 'ImpactDampening',
			'BulletSpeed'
		],
		[
			'ChgAttackPower', 'ChgImpact', 'ChgAccumImpact', 'ChgDirectAttackPower', 
			'ChgBlastRadius', 'ChgHeatBuildup', 'ChgBulletSpeed', 'FullChgAttackPower', 
			'FullChgImpact', 'FullChgAccumImpact', 'FullChgDirectAttackPower', 
			'FullChgBlastRadius', 'FullChgHeatBuildup', 'IGDamageMitigation', 
			'IGImpactDampening', 'IGDuration', 'DplyHeatBuildup', 'FullChgBulletSpeed'
		],
		[
			'DirectHitAdjustment', 'ChgDirectHitAdjustment', 'FullChgDirectHitAdjustment', 
			'PAInterference', 'Recoil', 'MaxRecoilAngle', 'Guidance', 
			'IdealRange',  'EffectiveRange', 'ChgIdealRange', 'ChgEffectiveRange', 
			'HomingLockTime', 'MaxLockCount', 'RapidFire', 'BurstFireInterval', 'ChgENLoad',
			'ChargeTime', 'FullChgTime', 'ChgAmmoConsumption', 'FullChgAmmoConsump', 
			'MagazineRounds', 'MagDumpTime', 'TotalRounds', 'ReloadTime', 'ReloadTimeOverheat', 
			'DeploymentRange', 'Cooling', 'CoolingDelay', 'AmmunitionCost'
		],
		['Weight', 'ENLoad']
	],
	'Head': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		[
			'AttitudeStability', 'SystemRecovery', 'ScanDistance', 'ScanEffectDuration',
			'ScanStandbyTime'
		],
		['Weight', 'ENLoad']
	],
	'Core': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		[
			'AttitudeStability', 'BoosterEfficiencyAdj', 'GeneratorOutputAdj', 
			'GeneratorSupplyAdj'
		],
		['Weight', 'ENLoad']
	],
	'Arms': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		['ArmsLoadLimit', 'RecoilControl', 'FirearmSpecialization', 'MeleeSpecialization'],
		['Weight', 'ENLoad']
	],
	'Legs': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		[
			'AttitudeStability', 'LoadLimit', 'JumpDistance', 'JumpHeight', 'TravelSpeed',
			'HighSpeedPerf'
		],
		[
			'Thrust', 'UpwardThrust', 'UpwardENConsumption', 'QBThrust', 'QBJetDuration',
			'QBENConsumption', 'QBReloadTime',
			'QBReloadIdealWeight', 'ABThrust', 'ABENConsumption', 'MeleeAttackThrust'
		],
		['Weight', 'ENLoad']
	],
	'Booster': [
		['Thrust', 'UpwardThrust', 'UpwardENConsumption'],
		[
			'QBThrust', 'QBJetDuration','QBENConsumption', 'QBReloadTime','QBReloadIdealWeight'
		],
		['ABThrust', 'ABENConsumption'],
		['MeleeAttackThrust', 'MeleeAtkENConsump'],
		['Weight', 'ENLoad']
	],
	'FCS': [
		['CloseRangeAssist', 'MediumRangeAssist', 'LongRangeAssist'],
		['MissileLockCorrection', 'MultiLockCorrection'],
		['Weight', 'ENLoad']
	],
	'Generator': [
		[
			'ENCapacity', 'ENRecharge', 'SupplyRecovery', 'PostRecoveryENSupply', 
			'EnergyFirearmSpec',
		],
		['Weight', 'ENOutput']
	],
	'Expansion': [
		[
			'AttackPower', 'Impact', 'AccumulativeImpact', 'BlastRadius', 'EffectRange',
			'Resilience', 'Duration'
		],
		['DirectHitAdjustment']
	]
};

/***************************************************************************************/

export function capitalizeFirstLetter(str) {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

const displayStringTable = {'rightArm': 'R-ARM UNIT', 'leftArm': 'L-ARM UNIT', 
	'rightBack': 'R-BACK UNIT', 'leftBack': 'L-BACK UNIT', 'fcs': 'FCS', 
	'QBENConsumption': 'QB EN Consumption', 'ABENConsumption': 'AB EN Consumption',
	'EffectiveAPKinetic': 'Effective AP (Kinetic)', 
	'EffectiveAPEnergy': 'Effective AP (Energy)',
	'EffectiveAPExplosive': 'Effective AP (Explosive)',
	'EffectiveAPAvg': 'Effective AP (Avg.)', 'QBENRechargeTime': 'QB EN Recharge Time',
	'ENRechargeDelayRedline': 'EN Rech. Delay (Redline)',
	'FullRechargeTimeRedline': 'Full Rech. Time (Redline)',
	'RightBackMissileLockTime': 'R-Back Missile Lock Time',
	'LeftBackMissileLockTime': 'L-Back Missile Lock Time',
	'ACS Failure': 'ACS Failure', 'Semi-Auto': 'Semi-Auto', 'Full-Auto': 'Full-Auto',
	'ReloadTimeOverheat': 'Reload Time (Overheat)',
	'GroundedBoostSpeed': 'Boost Speed (Grounded)',
	'AerialBoostSpeed': 'Boost Speed (Aerial)',
	'DefaultOrdering': 'Default',
	'ChgDirectHitAdjustment': 'Chg Direct Hit Adj.',
	'FullChgDirectHitAdjustment': 'Full Chg Direct Hit Adj.'
};

function stringInsert(str, insert, pos) {
	return str.substr(0, pos) + insert + str.substr(pos);
}

export function splitCamelCase(str) {
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

export function toDisplayString(str) {
	const fromTable = displayStringTable[str];
	if(fromTable !== undefined)
		return fromTable;

	const res = splitCamelCase(str);

	return capitalizeFirstLetter(res);
}

const multChar = '\u00d7'

function roundValue(val) {
	if(val === null)
		return val;
	// Rounding is performed depending on how much space the number takes
	const leftDigits = Math.floor(Math.log10(val)) + 1;
	const roundedRightDigits = Math.max(0, Math.min(2, 3 - leftDigits));
	// ^ 0 decimals if 3 left digits or more, max 2 decimals
	const roundFactor = 10 ** roundedRightDigits;
	return Math.round(val * roundFactor) / roundFactor;
}

export function toValueAndDisplayNumber(raw) {
	let value;
	let display;
	if(raw && raw.constructor === Array) {
		value = raw[0] * raw[1];
		display = roundValue(raw[0]).toString() + multChar + raw[1].toString();
	} else {
		value = raw;
		display = roundValue(raw);
	}
	return [value, display];
}

export const boxCharacter = '\u25a0';

export function notify(msg) {
	return toast(msg, 
		{style: {background: paletteColor(0)}, type:'info', position: "top-right", 
			autoClose: 3000, transition: Slide}
	)
}

export function partSortingFunction(key, ascend, a, b) {
	const order = ascend ? 1 : -1;
	// Default is set so that parts without the key will always come after the others
	const defaultVal = order === 1 ? Infinity : -Infinity;
	let aVal = a[key] == null ? defaultVal : a[key];
	let bVal = b[key] == null ? defaultVal : b[key];
	// Resolve list specs
	if (aVal.constructor === Array) aVal = aVal[0] * aVal[1];
	if (bVal.constructor === Array) bVal = bVal[0] * bVal[1];
	// Sort alphabetically is key is equal
	let res;
	if(aVal > bVal)      
		res = order;
	else if(aVal < bVal)
		res = -order;
	else
		res = a['Name'] > b['Name'] ? order : -order;
	return res
}

const meleeSpecStats = ['AttackPower', 'ComboDamage', 'DirectAttackPower',
	'ComboDirectDamage', 'ChgAttackPower', 'ChgDirectAttackPower'];
const missileLockCorrectionStats = ['HomingLockTime', 'Damage/s', 'Impact/s', 'AccImpact/s', 
	'Damage/sInclReload', 'Impact/sInclReload', 'AccImpact/sInclReload', 'MagDumpTime',
	];
const energyFirearmSpecStats = ['AttackPower', 'Damage/s', 'Damage/sInclReload', 
	'DirectAttackPower', 'DirectDamage/s', 'ChgAttackPower', 'FullChgAttackPower', 
	'ChargeTime', 'FullChgTime', 'ChgDirectAttackPower', 'FullChgDirectAttackPower'];

function getModifiedDmgSpec(baseValue, modifyingSpec) {
	const correction = 1 + (modifyingSpec - 100) / 200.;

	if(baseValue.constructor === Array)
		return [baseValue[0] * correction, baseValue[1]]
	else
		return baseValue * correction	
}

function modifyUnitSpec(part, name, assembly) {
	if(part['IsMeleeSpec'] && meleeSpecStats.includes(name)) {
		// Melee specialization
		return getModifiedDmgSpec(part[name], (assembly.arms)['MeleeSpecialization']);
	} else if(part['WeaponType'] === 'Homing' && missileLockCorrectionStats.includes(name)) {
		// Missile lock correction
		const baseLockTime = part['HomingLockTime'];
		const correction = 2 - (assembly.fcs)['MissileLockCorrection'] / 100.;
		const newLockTime = baseLockTime * correction;
		if(name === 'HomingLockTime')
			return newLockTime;

		const [newRapidFire, bulletGroupSize] = dataFuncs.normalizeRapidFire(
			part['Name'], part['RapidFire'], part['AttackPower'], part['HomingLockDelay'], 
			newLockTime);

		if(name === 'Damage/s') 
			return dataFuncs.resolveList(part['AttackPower']) * newRapidFire;
		else if(name === 'Impact/s') 
			return dataFuncs.resolveList(part['Impact']) * newRapidFire;
		else if(name === 'AccumulativeImpact/s') 
			return dataFuncs.resolveList(part['AccumulativeImpact']) * newRapidFire;

		const groupMagSize = part['MagazineRounds'] / bulletGroupSize;
		const newMagDumpTime = (groupMagSize - 1) / newRapidFire;
		if(name === 'MagDumpTime')
			return newMagDumpTime;

		let oldDen = part['ReloadTime'];
		let newDen = part['ReloadTime'];
		if(part['Name'] === 'IA-C01W3: AURORA')
			newDen *= 2 - (assembly.generator)['EnergyFirearmSpec'] / 100.;
		if(baseLockTime) {
			oldDen += baseLockTime;
			newDen += newLockTime;
		}
		if(part['MagDumpTime']) {
			oldDen += part['MagDumpTime'];
			newDen += newMagDumpTime;
		}

		var baseValue;
		if(part['IsEnergyFirearmSpec'] && energyFirearmSpecStats.includes(name)) {
			//this is only used for Aurora
			baseValue = getModifiedDmgSpec(
				part[name],
				(assembly.generator)['EnergyFirearmSpec']
			);
		} else
			baseValue = part[name];

		return baseValue * oldDen / newDen;
	} else if(part['IsEnergyFirearmSpec'] && energyFirearmSpecStats.includes(name)) {
		// Energy firearm specialization		
		if(['ChargeTime', 'FullChgTime'].includes(name)) {
			const correction = 2 - (assembly.generator)['EnergyFirearmSpec'] / 100.;
			return part[name] * correction;
		}
		return getModifiedDmgSpec(part[name], (assembly.generator)['EnergyFirearmSpec']);
	} else
		return part[name]
}

// This should be completely refactored, we should modify all the specs in one go instead 
// of going through them one by one. It simplify the code, make it faster and remove the 
// special treatment for Aurora
export function getModifiedPartsData(part, assembly) {
	let modifiedSpecs = Object.fromEntries(
		Object.keys(part).map(
			key => [key, modifyUnitSpec(part, key, assembly)]
		)
	);
	if(part['Name'] === 'IA-C01W3: AURORA') {
		const correction = 2 - (assembly.generator)['EnergyFirearmSpec'] / 100.;
		modifiedSpecs['ReloadTime'] *= correction;
	}
	return modifiedSpecs;
}

/***************************************************************************************/

export function total(list) {
	return list.reduce((val, acc) => val + acc);
}

export function mean(list) {
	if(list.length === 0)
		return undefined;
	return total(list) / list.length
}

// returns slope and intercept of a line passing through points [x1, y1] and [x2, y2]
function lineParameters([[x1, y1], [x2, y2]]) {
	return [(y1 - y2) / (x1 - x2), (x2*y1 - x1*y2) / (x2 - x1)];
}

export function piecewiseLinear(x, breakpoints) {
	const lastPos = breakpoints.length - 1;

	if(x < breakpoints[0][0]) {
		return breakpoints[0][1];
	} else if (x >= breakpoints[lastPos][0]) {
		return breakpoints[lastPos][1];
	}

	let result = null;
	for (let i = 1; i < lastPos + 1; i++) {
		if (x < breakpoints[i][0]) {
			const [m, q] = lineParameters(breakpoints.slice(i - 1, i + 1))
			result = m * x + q
			break;
		}
	}

	return result;
}

export function partitionList(list, subLength) {
	const subLists = [];
	let tempSubList = [];
	let innerIdx = 0;

	list.map(
		colName => {
			if(innerIdx > subLength - 1) {
				subLists.push(tempSubList);
				tempSubList = [];
				innerIdx = 0;
			}
			tempSubList.push(colName);
			innerIdx++;
			return null;
		}
	);
	for(let i = tempSubList.length - 1; i < subLength - 1; i++)
		tempSubList.push(null)
	subLists.push(tempSubList);

	return subLists;
}

/***************************************************************************************/

function toKind(className) {
	if(['armUnit', 'backUnit'].includes(className))
		return 'Unit';
	else if(className === 'fcs')
		return 'FCS';
	else
		return capitalizeFirstLetter(className);
}

export function toSlotName(className) {
	if(className === 'armUnit')
		return 'leftArm';
	else if (className === 'backUnit')
		return 'leftBack'
	else
		return className
}

function getDefaultDataColumns(partClass) {
	const dataKeys = tableData[partClass].map(part => Object.keys(part)).flat();
	const uniqueDataKeys = dataKeys.filter((col, pos, allKeys) => allKeys.indexOf(col) === pos);
	// We could just return uniqueDataKeys, but using the global list gives us a nicer 
	// default ordering
	let res = partStatGroups[toKind(partClass)].flat();
	res.unshift('Name');
	res = res.filter(col => uniqueDataKeys.includes(col));
	return res
}

function getTableData(partClass) {
	const slotName = toSlotName(partClass);
	const ids = getPartIdsForSlot(slotName, 0);
	const parts = ids.map(id => partsData[id]).filter(
		part => part['Name'] !== '(NOTHING)'
	);
	return parts;
}

export const partClasses = ['armUnit', 'backUnit', 'head', 'core', 'arms', 'legs', 'booster',
	'fcs', 'generator', 'expansion'];

export const tableData = [];
partClasses.map(c => {tableData[c] = getTableData(c); return null});

export const defaultTableColumns = [];
partClasses.map(c => {defaultTableColumns[c] = getDefaultDataColumns(c); return null});

export const allUnitFilters = {
	'AttackType': ['Explosive', 'Energy', 'Kinetic', 'Coral'],
	'WeaponType': ['Burst', 'Charge', 'Melee', 'Homing', 'Semi-Auto', 'Full-Auto', 'Shield'],
	'ReloadType': ['Single Shot', 'Overheat', 'Magazine'],
	'AdditionalEffect': ['ACS Failure', 'Camera Disruption', 'Shock', 'NoEffect']
};