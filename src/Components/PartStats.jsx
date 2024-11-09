import StatsRow from './StatsRow.jsx';

const hidddenPartStats = ['Name', 'Kind', 'Manufacturer', 'Description', 'AttackType', 
	'WeaponType', 'ReloadType', 'AdditionalEffect', 'RightArm', 'LeftArm', 'RightBack', 'LeftBack','ID'];

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

	if(part['Kind'] === 'Unit') 
		desc = part['Description']
	else
		desc = part['Kind']
	return(
		<>
			<div>{desc}</div>
			<div>{part['Name']}</div>
			<div>{part['Manufacturer']}</div>
			<div>{part['AttackType']}</div>
			<div>{part['WeaponType']}</div>
			<div>{part['ReloadType']}</div>
			<div>{part['AdditionalEffect']}</div>
		</>
	)
}

const PartStats = ({previewPart, curPart, visible}) => {

	if(previewPart === null) {
		let nullPart = toNullStats(curPart);
		var [leftPart, rightPart] = [nullPart, curPart];
	}
	else {
		var [leftPart, rightPart] = [curPart, previewPart];
	}

	const leftFiltered = filterPartStats(leftPart)
	const rightFiltered = filterPartStats(rightPart)	

	let style = {flex: '0 1 600px'}
	if(!visible)
		style['visibility'] = 'hidden'

	return (
		<>
		<div style = {style}>
			<PartStatsHeader part={rightPart} />
			<table>
			<tbody>
				{
					Object.keys(rightFiltered).map(
						name => <StatsRow 
							name = {name}
							left = {leftFiltered[name]}
							right = {rightFiltered[name]} 
							key = {name}
						/>
					)
				}
			</tbody>
			</table>
		</div>
		</>
	);
}

export default PartStats;