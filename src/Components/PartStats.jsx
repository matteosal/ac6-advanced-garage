import StatsRow from './StatsRow.jsx';

import {globUnitIcons, globManufacturerLogos, globNoneUnit} from '../Misc/Globals.js';

const hidddenPartStats = ['Name', 'Kind', 'Manufacturer', 'Description', 'AttackType', 
	'WeaponType', 'ReloadType', 'AdditionalEffect', 'LegType', 'GeneratorType', 'RightArm', 'LeftArm', 'RightBack', 'LeftBack','ID'];

function filterPartStats(stats) {
	let entries = Object.entries(stats);
	let filteredEntries = entries.filter(([prop, val]) => !hidddenPartStats.includes(prop));
	return Object.fromEntries(filteredEntries)
}

function toNullStats(part) {
	return Object.fromEntries(
		Object.entries(part).map(([k, v]) => [k, null])
	)
}

const PartStatsHeader = ({part}) => {
	let desc;

	const isUnit = part['Kind'] === 'Unit' && part['ID'] !== globNoneUnit['ID']
	if(isUnit) {
		desc = part['Description']
		var atkTypeImg = globUnitIcons[part['AttackType'] + '.png'];
		var wpnTypeImg = globUnitIcons[part['WeaponType'] + '.png'];
		var rldTypeImg = globUnitIcons[part['ReloadType'] + '.png'];
		var addEffImg;
		if(part['AdditionalEffect'] === undefined)
			addEffImg = globUnitIcons['NoEffect.png']
		else
			addEffImg = globUnitIcons[part['AdditionalEffect'] + '.png'];		
	}
	else
		desc = part['Kind']

	const manufacturerLogo = globManufacturerLogos[part['Manufacturer'] + '.png']

	return(
		<>
			<div style={{display: 'inline-block'}}>
				<div>{desc}</div>
				<div>{part['Name']}</div>
				{
					isUnit ? 
						<div>
							<img src={atkTypeImg} />
							<img src={wpnTypeImg} />
							<img src={rldTypeImg} />
							<img src={addEffImg} />
						</div> :
					<div></div>
				}
			</div>
			<div style={{display: 'inline-block'}}>
				<img src={manufacturerLogo} width='100px' />
			</div>
		</>
	)
}

const PartStats = ({previewPart, curPart}) => {

	if(curPart === undefined) {
		return <div></div>
	}

	if(previewPart === null) {
		let nullPart = toNullStats(curPart);
		var [leftPart, rightPart] = [nullPart, curPart];
	}
	else {
		var [leftPart, rightPart] = [curPart, previewPart];
	}

	const leftFiltered = filterPartStats(leftPart)
	const rightFiltered = filterPartStats(rightPart)

	return (
		<>
			<PartStatsHeader part={rightPart} />
			<table>
			<tbody>
				{
					Object.keys(rightFiltered).map(
						name => <StatsRow 
							name = {name}
							left = {leftFiltered[name]}
							right = {rightFiltered[name]}
							kind = {rightPart['Kind']} 
							key = {name}
						/>
					)
				}
			</tbody>
			</table>
		</>
	);
}

export default PartStats;