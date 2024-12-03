import {useState, useReducer, useContext, useRef} from 'react';

import * as glob from '../Misc/Globals.js';

const cellStyle = {
	width: '160px',
	padding: '5px 10px 5px 10px',
	borderLeft: '2px solid ' + glob.paletteColor(5),
	borderRight: '2px solid ' + glob.paletteColor(5),
	textAlign: 'center'
};

const DraggableHeader = ({name, pos, changeOrdering, isHovered, dragHandler}) => {

	const handleDragStart = (event) => {
		event.dataTransfer.setData(JSON.stringify(pos), pos);
	};

	const handleDragEnter = (event) =>  {
		const srcPos = Number(event.dataTransfer.types[0]);
		if(srcPos < pos)
			dragHandler({range: [srcPos + 1, pos], posDirection: true}, pos);
		else if(srcPos > pos)
			dragHandler({range: [pos, srcPos - 1], posDirection: false}, pos);
	}

	const handleDragLeave = (event) =>  {
		const srcPos = Number(event.dataTransfer.types[0]);
		if(srcPos !== pos)
			setTimeout(
				() => dragHandler(
					{range: null, posDirection: srcPos < pos},
					pos
				), 
				25
			);
	}

	const handleDrop = (event) => {
		event.preventDefault();
		const srcPos = Number(event.dataTransfer.types[0]);
		if(srcPos !== pos) {
			dragHandler({range: null, posDirection: true});
			changeOrdering(srcPos, pos);
		}
	};

	const background = isHovered ? glob.paletteColor(5) : glob.paletteColor(4);

	return (
		<th 
			style={
				{
					...cellStyle,
					backgroundColor: background,
					cursor: 'move',
					border: '2px solid ' + glob.paletteColor(5)
				}
			}
			draggable
			onDragStart={handleDragStart}
			onDragEnd={() => {}}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={event => event.preventDefault()}
			onDrop={handleDrop}
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

const toDirectionChar = {'-1': '\u21d0', '1': '\u21d2', '0': longDashCharacter};

function getDirectionChar(shiftInfo, pos) {
	if(!shiftInfo.range)
		return longDashCharacter;
	else if(pos >= shiftInfo.range[0] && pos <= shiftInfo.range[1])
		return shiftInfo.posDirection ? '\u21d0' : '\u21d2'
	else
		return longDashCharacter;
}

const DraggableTable = ({data}) => {

	const [columnOrder, setColumnOrder] = useState(() => Object.keys(data[0]));
	const [previewShiftInfo, setPreviewShiftInfo] = useState({range: null, posDirection: true});

	const changeOrdering = (srcPos, dstPos) => {
		const newOrder = [...columnOrder];
		const [movedColumn] = newOrder.splice(srcPos, 1);
		newOrder.splice(dstPos, 0, movedColumn);
		setColumnOrder(newOrder);
	};

	const dragHandler = (newInfo, callerPos=null) => setPreviewShiftInfo(
		shiftInfo => {
			const {range, posDirection} = shiftInfo;
			const newRange = newInfo.range;
			const newPosDirection = newInfo.posDirection;
			if(range && newRange === null && callerPos) {
				const rangeEnd = newPosDirection ? range[1] : range[0];
				return rangeEnd === callerPos ? {range: null, posDirection: null} : shiftInfo;;
			} else
				return newInfo
		}
	);

	return (
		<table style={{tableLayout: 'fixed', borderCollapse: 'collapse', width: 'auto', 
			width: '100%'}}>
			<thead>
			<tr>
				{
					columnOrder.map(
						(name, pos) => <td style={{...cellStyle, fontSize: '20px'}}>
							{getDirectionChar(previewShiftInfo, pos)}
						</td>
					)
				}
			</tr>
			<tr>
				{
					columnOrder.map(
						(name, pos) => <DraggableHeader
							key={name}
							name={name}
							pos={pos}
							changeOrdering={changeOrdering}
							isHovered={
								previewShiftInfo.range && 
								pos >= previewShiftInfo.range[0] && 
								pos <= previewShiftInfo.range[1]
							}
							dragHandler={dragHandler}
						/>
					)
				}
			</tr>
			</thead>
			<tbody>
				{
					data.map(
						(row, rowIndex) => <tr 
							style={{backgroundColor: glob.tableRowBackground(rowIndex)}}
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
/*	const range = [...Array(8).keys()];
	const data = [Object.fromEntries(range.map(
		i => [i, 'val' + i]
	))];*/
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