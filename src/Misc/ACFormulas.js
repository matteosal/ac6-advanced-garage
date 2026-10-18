import * as glob from './Globals.js';

/***************************************************************************************/

// Speed/boost multiplier graphs and the energy-recovery formulas shared by the build tab
// (ACStats.jsx) and the parts optimizer. Extracted from ACStats.jsx so both features use
// a single source of truth for these values instead of re-deriving them.

// graphs 260, 263, 290 
const boostBreakpoints = [[4., 1.], [6.25, 0.925], [7.5, 0.85], [8., 0.775], [12, 0.65]];
const qbBreakpoints = [[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]];
const overweightBreakpoints = 
	[[1., 1.], [1.05, 0.95], [1.1, 0.8], [1.3, 0.75], [1.5, 0.7]];

export const speedBreakpoints = {
	boostGrounded: [boostBreakpoints, overweightBreakpoints],
	boostGroundedFortaleza: [
		[[5, 1], [6.25, 0.94], [7.5, 0.86], [10, 0.75], [15, 0.6]], // graph 224
		overweightBreakpoints
	],
	boostGroundedTank: [
		[[5, 1], [7.5, 0.9], [10, 0.85], [12, 0.8], [14, 0.7]], // graph 274
		overweightBreakpoints
	],
	boostAerial: [boostBreakpoints, overweightBreakpoints],
	quickBoost: [qbBreakpoints, overweightBreakpoints],
	upwards: [
		[[4., 1.], [6.25, 0.9], [7.5, 0.85], [8., 0.8], [12, 0.7]], // graph 262
		overweightBreakpoints
	],
	assaultBoost: [
		[[4., 1.], [5, 0.95], [7.5, 0.9], [10, 0.7], [15, 0.55]], // graph 267
		overweightBreakpoints
	],
	meleeBoost: [
		[[4., 1.], [6.25, 0.95], [7.5, 0.85], [8, 0.75], [12, 0.65]], // graphs 268, 269
		overweightBreakpoints
	],
	hover: [
		[[7., 1.], [9, 0.9], [10, 0.85], [11, 0.75], [12, 0.7]], // graph 282
		[[1., 1.], [1.05, 0.9], [1.1, 0.8], [1.3, 0.7], [1.5, 0.6]] // graph 296
	],
	hoverQuickBoost: [
		qbBreakpoints,
		[[1., 1.], [1.05, 0.75], [1.1, 0.5], [1.3, 0.25], [1.5, 0.]] // graph 293
	]
}

export function getSpeedSpec(base, weight, loadRatio, breakpointsMult, breakpointsOver) {
	let multiplier = glob.piecewiseLinear(weight / 10000., breakpointsMult);
	if(loadRatio > 1)
		multiplier *= glob.piecewiseLinear(loadRatio, breakpointsOver);
	return base * multiplier
}

export function getQBReloadTime(baseReloadTime, idealWeight, weight) {
	const multiplier = glob.piecewiseLinear(
		(weight - idealWeight) / 10000., 
		[[0, 1], [0.5, 1.1], [1, 1.3], [3, 3], [5, 3.5]] // graph 320
	);
	return baseReloadTime * multiplier;
}

export function getENSupplyEfficiency(enOutput, enLoad) {
	if(enLoad > enOutput)
		return 100;
	const res = glob.piecewiseLinear(enOutput - enLoad,
		[[0., 1500.], [1800., 9000.], [3500., 16500.]]
	);
	return res;
}

export function getRechargeDelays(generator, core) {
	const factor = (2 - core['GeneratorSupplyAdj']/100.);
	return Object.fromEntries(
		[['normal', 'ENRecharge'], ['redline', 'SupplyRecovery']].map(
			([key, prop]) => [key, 1000 / generator[prop] * factor]
		)
	)
}

export function timeToRecoverEnergy(energy, supplyEff, delay) {
	return energy / supplyEff + delay;
}
