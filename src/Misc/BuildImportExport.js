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
const starterAssembly = Object.fromEntries(
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
		let allowedParts = glob.getPartsForSlot(slot, 0);
		if(['rightBack', 'leftBack'].includes(slot))
			allowedParts = allowedParts.concat(glob.getPartsForSlot(slot, 1));

		const match = allowedParts.find(part => part['ID'] === partId);
		const isNoneBooster = slot === 'booster' && partId === glob.noneBooster['ID'];
		if(match === undefined && !isNoneBooster)
			throw Object.assign(
				new Error(
					'part ' + assembly[slot]['Name'] + ' is not allowed for slot \'' + slot + '\''
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

function parseQuery(query) {
	if(!query)
		return starterAssembly;

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

export function getInitialBuild(query) {
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
	const url = window.location.origin + '/search?build=' + idString;
	const promise = navigator.clipboard.writeText(url);
	promise.then(() => glob.notify('Link copied to clipboard'));
}