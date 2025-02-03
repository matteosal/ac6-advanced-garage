import * as glob from '../Misc/Globals.js';

/***************************************************************************************/

const starterACPartNames = [
	'RF-024 TURNER',
	'HI-32: BU-TT/A',
	'BML-G1/P20MLT-04',
	'(NOTHING)',
	'HC-2000 FINDER EYE',
	'CC-2000 ORBITER',
	'AC-2000 TOOL ARM',
	'2C-2000 CRAWLER',
	'BST-G1/P10',
	'FCS-G1/P01',
	'AG-J-098 JOSO',
	'(NOTHING)'
];
const assemblyKinds = ['Unit', 'Unit', 'Unit', 'Unit', 'Head', 'Core', 'Arms', 'Legs',
	'Booster', 'FCS', 'Generator', 'Expansion'];
export const starterAssembly = Object.fromEntries(
	starterACPartNames.map(
		(name, pos) => [
			glob.partSlots[pos],
			glob.partsData.find(
				part => part.Kind === assemblyKinds[pos] && part.Name === name
			)
		]
	)
);

function validateAssembly(assembly) {
	// Check that each part is allowed for the slot
	for(let pos = 0; pos < glob.partSlots.length; pos++) {
		const slot = glob.partSlots[pos];
		const partId = assembly[slot]['ID'];
		let allowedParts = glob.getPartIdsForSlot(slot, 0).map(id => glob.partsData[id]);
		if(['rightBack', 'leftBack'].includes(slot))
			allowedParts = allowedParts.concat(
				glob.getPartIdsForSlot(slot, 1).map(id => glob.partsData[id])
			);

		const match = allowedParts.find(part => part['ID'] === partId);
		const isNoneBooster = slot === 'booster' && partId === glob.noneBooster['ID'];
		if(match === undefined && !isNoneBooster)
			throw Object.assign(
				new Error(
					'part ' + assembly[slot]['Name'] + ' of kind \'' + assembly[slot]['Kind'] + 
					'\' is not allowed for slot \'' + slot + '\''
				),
				{ parts: assembly }
			);
	}
	// Check that units are not duplicated on the same side
	for(const slot of ['rightBack', 'leftBack']) {
		const pairedSlot = glob.pairedUnitSlots[slot]
		const backId = assembly[slot]['ID'];
		if(backId !== glob.noneUnit['ID'] && backId === assembly[pairedSlot]['ID'])
			throw Object.assign(
				new Error(
					'unit ' + assembly[slot]['Name'] + ' is assigned to both the \'' + 
						pairedSlot + '\' and \'' + slot + '\' slots'
				),
				{ parts: assembly }
			);
	}
	// Check that tank legs and booster are correctly matched
	if(assembly.legs['LegType'] === 'Tank' && assembly.booster['ID'] !== glob.noneBooster['ID'])
		throw Object.assign(
			new Error('build has tank legs but a booster is set'),
			{ parts: assembly }
		);
	if(assembly.legs['LegType'] !== 'Tank' && assembly.booster['ID'] === glob.noneBooster['ID'])
		throw Object.assign(
			new Error('build has non-tank legs but no booster is set'),
			{ parts: assembly }
		);
}

const randomBuildIDs = {
	rightArm: [0, 1, 21, 23, 25, 26, 27, 29, 33, 34, 35, 36, 38, 39, 40, 43, 45, 49, 51, 52, 
		53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 67, 68, 77, 78, 85, 86, 87, 88, 95, 98,
		100, 101, 103, 104, 106],
	leftArm: [0, 1, 2, 21, 22, 23, 25, 26, 27, 29, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44,
		45, 46, 49, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 67, 68, 77, 
		78, 79, 85, 86, 87, 88, 89, 90, 95, 96, 97, 98, 99, 100, 101, 103, 104, 106],
	rightBack: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 
		23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 39, 40, 42, 43, 45, 47, 
		49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 72, 73, 
		74, 75, 77, 78, 80, 81, 82, 85, 86, 87, 88, 91, 92, 93, 94, 95, 98, 100, 101, 102, 
		103, 104, 105, 106],
	leftBack: [...Array(107).keys()],
	head: [...Array(23).keys()].map(i => i + 107),
	core: [...Array(17).keys()].map(i => i + 130),
	arms: [...Array(19).keys()].map(i => i + 147),
	legs: [...Array(25).keys()].map(i => i + 166),
	booster: [...Array(12).keys()].map(i => i + 191),
	fcs: [...Array(10).keys()].map(i => i + 203),
	generator: [...Array(14).keys()].map(i => i + 213),
	expansion:  [...Array(4).keys()].map(i => i + 227)
}

function getRandomPart(slot) {
	return glob.partsData[randomElement(randomBuildIDs[slot])];
}
function getPairedUnits(armSlot, backSlot) {
	const armPart = getRandomPart(armSlot);
	let backPart = getRandomPart(backSlot);
	while(backPart['ID'] === armPart['ID'])
		backPart = getRandomPart(backSlot);
	return [armPart, backPart];
}
function makeRandomBuild() {
	const [rArm, rBack] = getPairedUnits('rightArm', 'rightBack');
	const [lArm, lBack] = getPairedUnits('leftArm', 'leftBack');
	const legs = getRandomPart('legs');
	const booster = legs['LegType'] === 'Tank' ? glob.noneBooster : getRandomPart('booster');
	return {
		rightArm: rArm, rightBack: rBack,
		leftArm: lArm, leftBack: lBack,
		head: getRandomPart('head'),
		core: getRandomPart('core'),
		arms: getRandomPart('arms'),
		legs: legs,
		booster: booster,
		fcs: getRandomPart('fcs'),
		generator: getRandomPart('generator'),
		expansion: getRandomPart('expansion')
	}
}

function randomElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function parseQuery(query) {
	if(query === 'random')
		return makeRandomBuild();
	const ids = query.split('-').map(n => Number(n));
	// Check that we have 12 numeric ids
	if(ids.length !== 12)
		throw new Error('build code is is not formatted properly');

	for(const id of ids) { 
		if(Number.isNaN(id)) {
			throw new Error('build code is is not formatted properly');
		}
	}

	// Check that each id corresponds to a part and create assembly
	const assembly = {};
	for(let pos = 0; pos < glob.partSlots.length; pos++) {
		const slot = glob.partSlots[pos];
		const part = glob.partsData.find(part => part['ID'] === ids[pos]);
		if(part === undefined)
			throw new Error('part with id ' + ids[pos] + ' does not exist');
		assembly[slot] = part;
	}

	return assembly
}

export function parseBuildQuery(query) {
	// The query contains parts ids so this will break if they ever change. In case
	// that happens we should dump the original mapping between ids and parts into a
	// file and use that mapping to create/parse links
	try {
		const assembly = parseQuery(query);
		validateAssembly(assembly);
		return assembly;
	} catch(err) {
		let message = 'The provided build is invalid: ' + err.message + 
			'. The default build will be loaded instead.';
		if(err.parts) {
			message = message + ' The invalid build configuration is:\n';
			for(const part of Object.entries(err.parts))
				message = message + '\n' + part[0] + ': ' + part[1]['Name']
		}
		window.alert(message);
		return starterAssembly;
	}
}

export function copyBuildLink(parts) {
	const partIds = glob.partSlots.map(slot => parts[slot]['ID']);
	const idString = partIds.reduce(
		(acc, id, pos) => 
			pos === 0 ?
				acc + id :
				acc + '-' + id,
		''
	);
	const url = window.location.origin + window.location.pathname + '?build=' + idString;
	const promise = navigator.clipboard.writeText(url);
	promise.then(() => glob.notify('Link copied to clipboard'));
}