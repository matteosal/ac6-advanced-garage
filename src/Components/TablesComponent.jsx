import {useState, useReducer, useContext} from 'react';

import * as glob from '../Misc/Globals.js';

const cellStyle = {
	width: '160px',
	padding: '5px 10px 5px 10px',
	borderLeft: '2px solid ' + glob.paletteColor(5),
	borderRight: '2px solid ' + glob.paletteColor(5),
	textAlign: 'center'
};

const DraggableHeader = ({name, pos, moveColumn}) => {

	return (
		<th 
			style={
				{
					...cellStyle,
					backgroundColor: glob.tableRowBackground(0),
					cursor: 'move',
					border: '2px solid ' + glob.paletteColor(5)
				}
			}
		>
			{glob.toDisplayString(name)}
		</th>
	);
};

const longDashCharacter = '\u2012';

function toCellDisplay(val) {
	if(val === undefined)
		return longDashCharacter;
	else if (typeof val === 'string')
		return val.toUpperCase();
	else
		return val
}

const DraggableTable = ({data}) => {
	const [columnOrder, setColumnOrder] = useState(() => Object.keys(data[0]));

	const moveColumn = (fromIndex, toIndex) => {
		const newOrder = [...columnOrder];
		const [movedColumn] = newOrder.splice(fromIndex, 1);
		newOrder.splice(toIndex, 0, movedColumn);
		setColumnOrder(newOrder);
	};

	return (
		<table style={{tableLayout: 'fixed', borderCollapse: 'collapse', width: 'auto', 
			width: '100%'}}>
			<thead>
			<tr>
				{
					columnOrder.map(
						(name, pos) => <DraggableHeader
							key={name}
							name={name}
							pos={pos}
							moveColumn={moveColumn}
						/>
					)
				}
			</tr>
			</thead>
			<tbody>
				{
					data.map(
						(row, rowIndex) => <tr 
							style={{backgroundColor: glob.tableRowBackground(rowIndex + 1)}}
							key={rowIndex}
						>
							{
								columnOrder.map(
									name => <td style={cellStyle} key={name}>
										{toCellDisplay(row[name])}
									</td>
								)
							}
						</tr>
					)
				}
			</tbody>
		</table>
	);
};

const tableHidddenPartStats = ['Kind', 'Manufacturer', 'AttackType', 
	'WeaponType', 'ReloadType', 'AdditionalEffect', 'LegType', 'GeneratorType', 'RightArm', 
	'LeftArm', 'RightBack', 'LeftBack','ID'];

const TablesComponent = () => {
	const data = glob.getPartsForSlot('rightArm').map(
		part => Object.fromEntries(
			Object.entries(part).filter(
				([name, val]) => {
					return !tableHidddenPartStats.includes(name)
				}
			)
		)
	);
	return(
		<div 
			className='my-scrollbar'
			style={{
				...glob.dottedBackgroundStyle(),
				padding: '15px',
				height: '750px', overflow: 'auto'
			}}
		>
			<DraggableTable data={data} />
		</div>
	)
}

export default TablesComponent;