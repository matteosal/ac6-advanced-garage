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

function valueOrNaN(val) {
	return val ? val : NaN
}

// The game is inconsistent in what "a*b" means in attack power and impact specs
const takeFirstUnits = ['45-091 ORBT', 'BO-044 HUXLEY', 'MA-E-210 ETSUJIN', 'MA-E-211 SAMPU',
	'MA-J-201 RANSETSU-AR', 'WS-5001 SOUP'];
function resolveList(name, spec) {
	if(Number.isNaN(spec))
		return NaN;
	else if(spec.constructor === Array && takeFirstUnits.includes(name))
		return spec[0];
	else if(spec.constructor === Array)
		return spec[0] * spec[1];
	else
		return spec;
}

function addIfValid(obj, key, val) {
	if(!Number.isNaN(val))
		obj[key] = val;
	return val;
}

function addAdvancedUnitStats(unit) {
	let res = {...unit};

	// This is too complicated to compute and report
	if(unit['Description'] === 'Laser Turret')
		return res;

	const [rawAtkPwr, rawImpact, rawAccImpact, rapidFire, 
		consecutiveHits, lockTime, heatBuildup, cooling, coolingDelay] = 
		['AttackPower', 'Impact', 'AccumulativeImpact', 'RapidFire', 'ConsecutiveHits', 
			'HomingLockTime', 'ATKHeatBuildup', 'Cooling', 'CoolingDelay'].map(
		stat => valueOrNaN(unit[stat])
	);
	let [magSize, reloadTime] = ['MagazineRounds', 'ReloadTime'].map(
		stat => valueOrNaN(unit[stat])
	);

	if(unit['ReloadType'] === 'Single Shot')
		magSize = 1;
	else if(unit['ReloadType'] === 'Overheat') {
		// These are the mag size and cooldown time without overheat (1 shot away from 
		// overheating) which is the best case scenario. This means that Damage/sInclReload 
		// and related stats refer to this case
		const heatPerShot = heatBuildup - Math.max(0, 1 / rapidFire - coolingDelay) * cooling;
		magSize = addIfValid(res, 'MagazineRounds', Math.ceil(1000 / heatPerShot) - 1);
		reloadTime = addIfValid(res, 
			'ReloadTime', 
			coolingDelay + heatBuildup * magSize / cooling
		);		
	}

	const [atkPwr, impact, accImpact] = [rawAtkPwr, rawImpact, rawAccImpact].map(
		val => resolveList(unit['Name'], val)
	);

	const magDumpTime = addIfValid(res, 'MagDumpTime', magSize / rapidFire);

	// DPS/IPS related stats don't make sense for this
	if(unit['Description'] === 'Pulse Shield Launcher')
		return res;

	const dps = addIfValid(res, 'Damage/s', atkPwr * rapidFire);
	addIfValid(res, 'Impact/s', impact * rapidFire);
	addIfValid(res, 'AccumulativeImpact/s', accImpact * rapidFire);

	let den = reloadTime;
	den = Number.isNaN(magDumpTime) ? den : den + magDumpTime;
	den = Number.isNaN(lockTime) ? den : den + lockTime;
	addIfValid(res, 'Damage/sInclReload', magSize * atkPwr / den);
	addIfValid(res, 'Impact/sInclReload', magSize * impact / den);
	addIfValid(res, 'AccImpact/sInclReload', magSize * accImpact / den);

	const comboDmg = addIfValid(res, 'ComboDamage', atkPwr * consecutiveHits);
	addIfValid(res, 'ComboImpact', impact * consecutiveHits);
	addIfValid(res, 'ComboAccumulativeImpact', accImpact * consecutiveHits)

	if(rawAtkPwr.constructor === Array) 
		res['DirectAttackPower'] = [
			rawAtkPwr[0] * res['DirectHitAdjustment'] / 100,
			rawAtkPwr[1]
		]
	else
		addIfValid(res, 'DirectAttackPower', atkPwr * res['DirectHitAdjustment'] / 100);

	addIfValid(res, 'DirectDamage/s', dps * res['DirectHitAdjustment'] / 100);
	addIfValid(res, 'ComboDirectDamage', comboDmg * res['DirectHitAdjustment'] / 100);

	return res;
}

export function postprocessData(data) {
	let res = data.concat([noneUnitPre, noneBoosterPre, noneExpansionPre]);
	res = res.map((part, idx) => {return {...part, ...{ID: idx}}});
	res = res.map(
		part => part['Kind'] === 'Unit' ?
			addAdvancedUnitStats(part) :
			part
	);
	return res;
}

export function normalizeData(data, key) {
	const factor = key === 'Weight' ? 1000 : 100; // 1000 for Weight, 100 for EN Load
	return data.map(
		part => Object.fromEntries(
			Object.entries(part).map(
				([spec, val]) => {
					const normFactor = part[key] / factor;
					let newVal;
					if(normFactor === 0. || spec === 'ID') {
						newVal = val;
					} else if(typeof val === 'number') {
						newVal = val / normFactor;
					} else if(val.constructor === Array) {
						newVal = [val[0] / normFactor, val[1]];
					} else {
						newVal = val;
					}
					return [spec, newVal];
				}
			)
		)
	)
}

/***************************************************************************************/

function updateRange(kind, partEntry, res) {
	const [name, val] = partEntry;
	if(typeof val === 'number') {
		if(res[kind][name] === undefined) {
			res[kind][name] = [val, val];
			return;
		}

		if(val > res[kind][name][1])
			res[kind][name][1] = val;
		else if(val < res[kind][name][0])
			res[kind][name][0] = val;
	}
	return;
}


export function getPartStatsRanges(data) {
	let res = {'Unit': {}, 'Head': {}, 'Core': {}, 'Arms': {}, 'Legs': {},
		'Booster': {}, 'FCS': {}, 'Generator': {}, 'Expansion': {}};
	// Fills res
	data.map(
		part => {
			Object.entries(part).map(entry => updateRange(part['Kind'], entry, res));
			return null;
		}
	);
	return res;
}

function minMaxAcross(kinds, prop, partStatsRanges) {
	return kinds.reduce(
			(acc, kind) => {
				const minMax = partStatsRanges[kind][prop];
				return [acc[0] + minMax[0], acc[1] + minMax[1]]	
			},
			[0, 0]
		)	
}

export function getACStatRanges(partStatsRanges) {
	let res = {};
	// This is not 100% correct because we are taking the MinMax across all units for all
	// unit slots, but every slot has its own set of allowed units
	res['CurrentLoad'] = minMaxAcross(
		['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Booster', 'FCS', 'Generator'],
		'Weight',
		partStatsRanges
	);
	res['CurrentArmsLoad'] = minMaxAcross(['Unit', 'Unit'], 'Weight', partStatsRanges);
	res['CurrentENLoad'] = minMaxAcross(
		['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Legs', 'Booster', 'FCS'],
		'ENLoad',
		partStatsRanges
	);
	return res;
}

/***************************************************************************************/

function capitalizeFirstLetter(str) {
	return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function computePartsForSlot(slot, backSubslot, partsData, pairedUnitSlots) {

	const noneUnit = partsData.find(p => p['Name'] === '(NOTHING)' && p['Kind'] === 'Unit');
	const noneBooster = partsData.find(
		p => p['Name'] === '(NOTHING)' && p['Kind'] === 'Booster'
	);

	let slotFilterFunc;
	const slotCapitalized = slot === 'fcs' ? 'FCS' : capitalizeFirstLetter(slot);

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
			(part.Kind === slotCapitalized && part['ID'] !== noneBooster['ID']);
	} else {
		slotFilterFunc = part => (part.Kind === slotCapitalized);
	}
	return partsData.filter(slotFilterFunc);	
}

// Precompute the list of parts that can go into each slot
export function getRawPartsForSlot(partSlots, partsData, pairedUnitSlots) {
	let res = {};
	partSlots.map(
		(slot) => {
			if(!['leftBack', 'rightBack'].includes(slot))
				// 2nd arg is irrelevant
				res[slot] = computePartsForSlot(slot, 0, partsData, pairedUnitSlots); 
			else // This looks like shit
				res[slot] = {
					0: computePartsForSlot(slot, 0, partsData, pairedUnitSlots),
					1: computePartsForSlot(slot, 1, partsData, pairedUnitSlots)
				}
			return null;
		}
	);
	return res
}