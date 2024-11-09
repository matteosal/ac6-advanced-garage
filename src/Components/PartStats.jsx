import StatsRow from './StatsRow.jsx';

const hidddenPartStats = ['Kind', 'RightArm', 'LeftArm', 'RightShoulder', 
	'LeftShoulder','ID'];

function filterPartStats(entries) {
	return entries.filter(([prop, val]) => !hidddenPartStats.includes(prop));
}

const PartStats = ({previewPart, curPart, visible}) => {

	const curPartStats = Object.fromEntries(
		filterPartStats(Object.entries(curPart))
	);
	if(previewPart === null) {
		let nullStats = Object.fromEntries(
			Object.entries(curPartStats).map(([k, v]) => [k, null])
		);
		var [leftStats, rightStats] = [nullStats, curPartStats];
	}
	else {
		var previewStats = Object.fromEntries(
			filterPartStats(Object.entries(previewPart))
		);
		var [leftStats, rightStats] = [curPartStats, previewStats];
	}

	let style = {flex: '0 1 600px'}
	if(!visible)
		style['visibility'] = 'hidden'

	return (
		<>
		<div style = {style}>
		<table>
		<tbody>
		{
			Object.keys(rightStats).map(
				name => <StatsRow 
					name = {name}
					left = {leftStats[name]}
					right = {rightStats[name]} 
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