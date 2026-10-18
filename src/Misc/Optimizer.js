import * as glob from './Globals.js';
import {
	speedBreakpoints, getSpeedSpec, getENSupplyEfficiency,
	getRechargeDelays, timeToRecoverEnergy
} from './ACFormulas.js';

/***************************************************************************************/

// Parts optimizer logic. The optimizer searches head × core × arms × legs × booster ×
// generator combinations and keeps those that satisfy the user's weight/threshold
// constraints. All stats are computed with the exact same formulas used by the build tab
// (ACFormulas.js), reading from the shared parts data (glob.partsData).

function partsOfKind(kind) {
	return glob.partsData
		.filter(part => part['Kind'] === kind && part['Name'] !== '(NOTHING)')
		.sort((a, b) => a['DefaultOrdering'] - b['DefaultOrdering']);
}

function sortByDefaultOrdering(list) {
	list.sort((a, b) => (a['DefaultOrdering'] ?? Infinity) - (b['DefaultOrdering'] ?? Infinity));
	return list;
}

// Slot-legal unit lists ordered like the build window: (NOTHING) first, then parts by
// DefaultOrdering. Back slots list dedicated back units before arm units usable on the
// back, mirroring the build window's two subslots.
function moveNoneFirst(parts) {
	const nonePos = parts.findIndex(part => part['Name'] === '(NOTHING)');
	if(nonePos > 0) {
		const [none] = parts.splice(nonePos, 1);
		parts.unshift(none);
	}
	return parts;
}

function unitsForSlot(slot) {
	if(['rightBack', 'leftBack'].includes(slot)) {
		const backUnits = sortByDefaultOrdering(
			glob.getPartIdsForSlot(slot, 0).map(id => glob.partsData[id])
		);
		const armUnits = sortByDefaultOrdering(
			glob.getPartIdsForSlot(slot, 1).map(id => glob.partsData[id])
		);
		// (NOTHING) appears in both subslots; keep a single copy at the front.
		const none = backUnits.find(part => part['Name'] === '(NOTHING)');
		return [
			none,
			...backUnits.filter(part => part['Name'] !== '(NOTHING)'),
			...armUnits.filter(part => part['Name'] !== '(NOTHING)')
		];
	}
	return moveNoneFirst(sortByDefaultOrdering(
		glob.getPartIdsForSlot(slot, 0).map(id => glob.partsData[id])
	));
}

export const headList = partsOfKind('Head');
export const coreList = partsOfKind('Core');
export const armsList = partsOfKind('Arms');
export const legsList = partsOfKind('Legs');
export const boosterList = partsOfKind('Booster');
export const fcsList = partsOfKind('FCS');
export const generatorList = partsOfKind('Generator');

export const unitLists = {
	rightArm: unitsForSlot('rightArm'),
	leftArm: unitsForSlot('leftArm'),
	rightBack: unitsForSlot('rightBack'),
	leftBack: unitsForSlot('leftBack')
};

const noneExpansion = glob.partsData.find(
	part => part['Kind'] === 'Expansion' && part['Name'] === '(NOTHING)'
);

/***************************************************************************************/

function partByName(name) {
	return glob.partsData.find(part => part['Name'] === name);
}

export function getDefaultOptimizerInputs() {
	return {
		maxWeight: 75000,
		// Optimizable parts: null means "Any" (search every part of that kind).
		parts: {head: null, core: null, arms: null, legs: null, booster: null, generator: null},
		legTypes: {'Bipedal': true, 'Reverse-Joint': false, 'Tetrapod': false, 'Tank': false},
		stayWithinLoad: true,
		// Fixed equipment: (NOTHING) units and the OCELLUS FCS by default.
		equipment: {
			rightArm: glob.noneUnit['ID'],
			leftArm: glob.noneUnit['ID'],
			rightBack: glob.noneUnit['ID'],
			leftBack: glob.noneUnit['ID'],
			fcs: (partByName('IA-C01F: OCELLUS') || fcsList[0])['ID']
		},
		thresholds: {
			meleeSpec: 0, recoilControl: 0, minQB: 0, minQBSpeed: 0,
			minBoostSpeed: 0, minABDistance: 0, minMeleeQB: 0,
			minJumpDistance: 0, maxQBRegen: 0, maxFullEN: 0, maxRedlineFull: 0
		},
		weights: {effAP: 1, stability: 1}
	};
}

/***************************************************************************************/

export function resolveEquipmentParts(equipment) {
	return {
		rightArm: glob.partsData[equipment.rightArm],
		leftArm: glob.partsData[equipment.leftArm],
		rightBack: glob.partsData[equipment.rightBack],
		leftBack: glob.partsData[equipment.leftBack],
		fcs: glob.partsData[equipment.fcs]
	};
}

// Builds the full 12-slot assembly for a result row so the 🔧 link can reuse the build
// code format accepted by the build tab.
export function toAssembly(row, equipment) {
	const legs = row.legs;
	return {
		rightArm: equipment.rightArm,
		leftArm: equipment.leftArm,
		rightBack: equipment.rightBack,
		leftBack: equipment.leftBack,
		head: row.head,
		core: row.core,
		arms: row.arms,
		legs: legs,
		booster: legs['LegType'] === 'Tank' ? glob.noneBooster : row.booster,
		fcs: equipment.fcs,
		generator: row.generator,
		expansion: noneExpansion
	};
}

/***************************************************************************************/

// Computes all the stats of a single head/core/arms/legs/booster/generator combination
// given the fixed equipment. `src` is the booster source: the legs for Tank legs, the
// booster otherwise.
function computeCombination(head, core, arms, legs, booster, src, generator, othWeight,
	othEN, armUnitsWeight, maxWeight) {

	const isTank = legs['LegType'] === 'Tank';
	const fw = head['Weight'] + core['Weight'] + arms['Weight'] + legs['Weight'];
	const w0 = fw + othWeight + (isTank ? 0 : booster['Weight']);
	if(w0 > maxWeight)
		return null;
	const weight = w0 + generator['Weight'];
	if(weight > maxWeight)
		return null;

	const loadMargin = legs['LoadLimit'] - (weight - legs['Weight']);
	const armsMargin = arms['ArmsLoadLimit'] - armUnitsWeight;

	const enLoad = head['ENLoad'] + core['ENLoad'] + arms['ENLoad'] + legs['ENLoad'] +
		othEN + (isTank ? 0 : booster['ENLoad']);
	const enOutput = Math.floor(generator['ENOutput'] * 0.01 * core['GeneratorOutputAdj']);
	const eff = getENSupplyEfficiency(enOutput, enLoad);
	const delays = getRechargeDelays(generator, core);
	const cap = generator['ENCapacity'];

	const qc = src['QBENConsumption'] * (2 - core['BoosterEfficiencyAdj'] / 100.);
	const qbs = cap / qc;
	const qr = src['QBJetDuration'] + timeToRecoverEnergy(qc, eff, delays.normal);
	const fr = timeToRecoverEnergy(cap, eff, delays.normal);
	const rr = timeToRecoverEnergy(cap - generator['PostRecoveryENSupply'], eff, delays.redline);

	const loadRatio = (weight - legs['Weight']) / legs['LoadLimit'];
	const qsp = getSpeedSpec(src['QBThrust'] / 50., weight, loadRatio,
		speedBreakpoints.quickBoost[0], speedBreakpoints.quickBoost[1]);

	let boostKey = 'boostGrounded';
	if(legs['Name'] === 'EL-TL-11 FORTALEZA')
		boostKey = 'boostGroundedFortaleza';
	else if(isTank)
		boostKey = 'boostGroundedTank';
	const baseBoostSpeed = isTank ? legs['HighSpeedPerf'] : booster['Thrust'] * 6 / 100.;
	const bsp = getSpeedSpec(baseBoostSpeed, weight, loadRatio,
		speedBreakpoints[boostKey][0], speedBreakpoints[boostKey][1]);

	const assaultBoostSpeed = getSpeedSpec(src['ABThrust'] * 6 / 100., weight, loadRatio,
		speedBreakpoints.assaultBoost[0], speedBreakpoints.assaultBoost[1]);
	const abd = src['ABENConsumption'] > 0 ?
		(cap / src['ABENConsumption']) * assaultBoostSpeed / 3.6 : 0;

	const mqf = isTank ? 0 : cap / (booster['MeleeAtkENConsump'] + qc);

	const ap = head['AP'] + core['AP'] + arms['AP'] + legs['AP'];
	const kk = head['AntiKineticDefense'] + core['AntiKineticDefense'] +
		arms['AntiKineticDefense'] + legs['AntiKineticDefense'];
	const ee = head['AntiEnergyDefense'] + core['AntiEnergyDefense'] +
		arms['AntiEnergyDefense'] + legs['AntiEnergyDefense'];
	const xx = head['AntiExplosiveDefense'] + core['AntiExplosiveDefense'] +
		arms['AntiExplosiveDefense'] + legs['AntiExplosiveDefense'];

	return {
		head, core, arms, legs, booster, generator,
		effAP: ap * (kk + ee + xx) / 3000,
		ap,
		armor: (kk + ee + xx) / 3,
		kineticDefense: kk,
		energyDefense: ee,
		explosiveDefense: xx,
		stability: head['AttitudeStability'] + core['AttitudeStability'] + legs['AttitudeStability'],
		totalWeight: weight,
		frameWeight: fw,
		loadMargin,
		armsMargin,
		recoil: arms['RecoilControl'],
		jumpDist: legs['JumpDistance'] || null,
		qbs, qsp, bsp, abd, mqf, qr, fr, rr,
		score: 0
	};
}

export async function runOptimizationAsync(inputs, onProgress) {
	const th = inputs.thresholds;
	const stayWithinLoad = inputs.stayWithinLoad;
	// A 0 (or empty) max weight means no limit, matching the standalone optimizer.
	const maxWeight = inputs.maxWeight > 0 ? inputs.maxWeight : Infinity;

	if(!onProgress)
		onProgress = () => {};

	const eq = resolveEquipmentParts(inputs.equipment);
	const parts = inputs.parts;

	const armUnitsWeight = eq.rightArm['Weight'] + eq.leftArm['Weight'];
	const othWeight = armUnitsWeight + eq.rightBack['Weight'] + eq.leftBack['Weight'] +
		eq.fcs['Weight'];
	const othEN = eq.rightArm['ENLoad'] + eq.leftArm['ENLoad'] + eq.rightBack['ENLoad'] +
		eq.leftBack['ENLoad'] + eq.fcs['ENLoad'];

	const generatorCandidates = parts.generator === null ?
		generatorList : [glob.partsData[parts.generator]];
	const boosterCandidates = parts.booster === null ?
		boosterList : [glob.partsData[parts.booster]];

	const rows = [];

	// The search is chunked so the UI can repaint and update the progress bar between
	// chunks instead of blocking the main thread for the whole search.
	const totalFrames = headList.length * coreList.length * armsList.length * legsList.length;
	let frameCounter = 0;
	let lastYield = Date.now();
	const yieldIntervalMs = 40;

	function yieldIfNeeded() {
		if(Date.now() - lastYield < yieldIntervalMs)
			return null;
		onProgress(frameCounter / totalFrames);
		lastYield = Date.now();
		return new Promise(resolve => setTimeout(resolve, 0));
	}

	onProgress(0);

	for(const head of headList) {
		if(parts.head !== null && head['ID'] !== parts.head)
			continue;
		for(const core of coreList) {
			if(parts.core !== null && core['ID'] !== parts.core)
				continue;
			for(const arms of armsList) {
				if(parts.arms !== null && arms['ID'] !== parts.arms)
					continue;
				if(arms['MeleeSpecialization'] < th.meleeSpec)
					continue;
				if(arms['RecoilControl'] < th.recoilControl)
					continue;
				for(const legs of legsList) {
					frameCounter++;
					const yieldPromise = yieldIfNeeded();
					if(yieldPromise)
						await yieldPromise;

					if(parts.legs !== null && legs['ID'] !== parts.legs)
						continue;
					if(!inputs.legTypes[legs['LegType']])
						continue;
					if((legs['JumpDistance'] || 0) < th.minJumpDistance)
						continue;

					const isTank = legs['LegType'] === 'Tank';
					// Tank legs ignore the booster, so there is a single "none" booster.
					const boosters = isTank ? [glob.noneBooster] : boosterCandidates;
					const fw = head['Weight'] + core['Weight'] + arms['Weight'] + legs['Weight'];

					for(const booster of boosters) {
						const src = isTank ? legs : booster;
						const w0 = fw + othWeight + (isTank ? 0 : booster['Weight']);
						if(w0 > maxWeight)
							continue;

						for(const generator of generatorCandidates) {
							const row = computeCombination(head, core, arms, legs, booster, src,
								generator, othWeight, othEN, armUnitsWeight, maxWeight);
							if(!row)
								continue;
							if(stayWithinLoad && (row.loadMargin < 0 || row.armsMargin < 0))
								continue;
							if(row.qbs < th.minQB)
								continue;
							if(row.qsp < th.minQBSpeed)
								continue;
							if(row.bsp < th.minBoostSpeed)
								continue;
							if(th.minABDistance && row.abd < th.minABDistance)
								continue;
							if(th.minMeleeQB && (isTank || row.mqf < th.minMeleeQB))
								continue;
							if(th.maxQBRegen && row.qr > th.maxQBRegen)
								continue;
							if(th.maxFullEN && row.fr > th.maxFullEN)
								continue;
							if(th.maxRedlineFull && row.rr > th.maxRedlineFull)
								continue;
							rows.push(row);
						}
					}
				}
			}
		}
	}

	// Score = weighted sum of effective AP and stability, each min-max normalized across
	// the combinations currently allowed by the filters (so scores shift as filters change).
	const wE = inputs.weights.effAP;
	const wS = inputs.weights.stability;
	if(rows.length) {
		const makeNormalizer = key => {
			let lo = Infinity;
			let hi = -Infinity;
			for(const r of rows) {
				if(r[key] < lo) lo = r[key];
				if(r[key] > hi) hi = r[key];
			}
			return v => hi > lo ? (v - lo) / (hi - lo) : 1;
		};
		const nE = makeNormalizer('effAP');
		const nS = makeNormalizer('stability');
		const den = (wE + wS) || 1;
		for(const r of rows)
			r.score = 100 * (wE * nE(r.effAP) + wS * nS(r.stability)) / den;
	}

	rows.sort((a, b) => b.score - a.score);
	const shown = rows.slice(0, 100);

	onProgress(1);

	return {
		rows: shown,
		totalCount: rows.length,
		shownCount: shown.length
	};
}
