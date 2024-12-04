import {useState, useReducer, useContext, useRef} from 'react';

import * as glob from '../Misc/Globals.js';

function getCellStyle(thick) {
	const w = thick ? '5px' : '2px';
	return(
		{
			width: '160px',
			padding: '5px 10px 5px 10px',
			boxSizing: 'border-box',
			borderLeftWidth: w, borderRightWidth: w,
			borderLeftStyle: 'solid', borderRightStyle: 'solid',
			borderLeftColor: glob.paletteColor(5), borderRightColor: glob.paletteColor(5),
			textAlign: 'center'			
		}
	)
}

const longDashCharacter = '\u2012';
const doubleArrowRight = '\u00bb';
const doubleArrowLeft = '\u00ab';

function toCellDisplay(val) {
	if(val === undefined)
		return longDashCharacter;
	else if (typeof val === 'string')
		return val.toUpperCase();
	else
		return val
}

function getShiftSymbolsVisibility(shiftInfo, pos) {
	if(!shiftInfo.range)
		return ['hidden', 'hidden'];
	else if(pos >= shiftInfo.range[0] && pos <= shiftInfo.range[1])
		return shiftInfo.posDirection ? ['visible', 'hidden'] : ['hidden', 'visible']
	else
		return ['hidden', 'hidden'];
}

const DraggableHeader = ({name, pos, previewShiftInfo, changeOrdering, dragHandler}) => {

	const [isBeingDragged, setIsBeingDragged] = useState(false);

	const handleDragStart = (event) => {
		event.dataTransfer.setData(JSON.stringify(pos), pos);
		setIsBeingDragged(true);
	};

	const handleDragEnd = (event) => {
		setIsBeingDragged(false);
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

	const [leftVisible, rightVisible] = getShiftSymbolsVisibility(previewShiftInfo, pos);

	let rangeEndpoint = null;
	if(previewShiftInfo.range) {
		rangeEndpoint = previewShiftInfo.posDirection ? previewShiftInfo.range[1] :
			previewShiftInfo.range[0]
	}

	const cellBaseStyle = getCellStyle(pos === rangeEndpoint);
	const color = getHeaderColor(previewShiftInfo.range, rangeEndpoint, pos);

	return (
		<th 
			style={
				{
					...cellBaseStyle,
					backgroundColor: color,
					height: '50px',
					padding: '0px',
					borderBottom: '2px solid ' + glob.paletteColor(5),
					opacity: isBeingDragged ? 0.5 : 1
				}
			}
		>
			<div style=
				{{display: 'flex', justifyContent: 'center', alignItems: 'center', 
					height: '100%'}}
			>
				<div 
					style={{height: '100%', width: '10%', visibility: leftVisible, display: 'flex', alignItems:'center', justifyContent: 'center', cursor: 'default'}}
				>
					{doubleArrowLeft}
				</div>
				<div 
					style={{height: '100%', width: '80%', display: 'flex', alignItems:'center', justifyContent: 'center', cursor: 'grab'}}
					draggable
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={event => event.preventDefault()}
					onDrop={handleDrop}
				>
					{glob.toDisplayString(name)}
				</div>
				<div 
					style={{height: '100%', width: '10%', visibility: rightVisible, display: 'flex', alignItems:'center', justifyContent: 'center', cursor: 'default'}}
				>
					{doubleArrowRight}
				</div>
			</div>
		</th>
	);
};

function getHeaderColor(range, endpoint, pos) {
	if(pos === endpoint)
		return glob.paletteColor(5)
	else if(range && pos >= range[0] && pos <= range[1])
		return glob.paletteColor(4, 1, 1.5)
	else
		return glob.paletteColor(4)
}

const DraggableTable = ({data, columnOrder, setColumnOrder}) => {

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

	let rangeEndpoint = null;
	if(previewShiftInfo.range) {
		rangeEndpoint = previewShiftInfo.posDirection ? previewShiftInfo.range[1] :
			previewShiftInfo.range[0]
	}

	return (
		<table style={{tableLayout: 'fixed', borderCollapse: 'collapse', width: 'auto', 
			width: '100%', border: '2px solid ' + glob.paletteColor(5)}}>
			<thead>
			<tr>
				{
					columnOrder.map(
						(name, pos) => <DraggableHeader
							name={name}
							pos={pos}
							previewShiftInfo={previewShiftInfo}
							changeOrdering={changeOrdering}
							dragHandler={dragHandler}
							key={name}
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
									(name, pos) => <td style={getCellStyle(pos === rangeEndpoint)} key={name}>
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

const partClasses = ['armUnit', 'backUnit', 'head', 'core', 'arms', 'legs', 'booster',
	'fcs', 'generator', 'expansion'];

function toSlotName(className) {
	if(className === 'armUnit')
		return 'rightArm';
	else if (className === 'backUnit')
		return 'rightBack'
	else
		return className
}

function toKind(className) {
	if(['armUnit', 'backUnit'].includes(className))
		return 'Unit';
	else if(className === 'fcs')
		return 'FCS';
	else
		return glob.capitalizeFirstLetter(className);
}

const ClassBox = ({partClass, selected, setter}) => {
	const [highlighted, setHighlighted] = useState(false);

	const imgStyle = {width: '60px'};
	if(selected)
		imgStyle['filter'] = 'brightness(1.6)';
	else if(highlighted)
		imgStyle['filter'] = 'brightness(1.3)';

	const img = glob.slotImages[glob.toImageFileName(toSlotName(partClass))];
	return (
		<div 
			style={{display: 'flex'}}
			onMouseEnter={() => setHighlighted(true)}
			onMouseLeave={() => setHighlighted(false)}
			onClick={setter}
		>
			<img src={img} style={imgStyle}/>
		</div>
	)
}

function getTableData(partClass) {
	const slotName = toSlotName(partClass);

	const parts = glob.getPartsForSlot(slotName, 0).filter(
		part => part['Name'] !== '(NOTHING)'
	);

	return(
		parts.map(
			part => Object.fromEntries(
				Object.entries(part).filter(
					([name, val]) => {
						return !tableHidddenPartStats.includes(name)
					}
				)
			)
		)
	)
}

// We could get these by taking the union of all keys in the data, but taking them from the
// global list gives us a nicer default ordering
function getDataColumns(kind) {
	let res = glob.partStatGroups[kind].flat();
	res.unshift('Name');
	return res
}

const ClassSelector = ({setData, setColumnOrder}) => {
	const [selectedClass, setSelectedClass] = useState('armUnit');

	const setter = (partClass) => {
		const data = getTableData(partClass);
		setSelectedClass(partClass);
		setData(data);
		setColumnOrder(getDataColumns(toKind(partClass)));
	}

	return(
		<div style={{display: 'flex', alignItems: 'center'}}>
			<div style={{marginRight: '5px'}}>{'PART CLASS: '}</div>
			{
				partClasses.map(
					partClass => <ClassBox 
						partClass={partClass}
						selected={partClass === selectedClass}
						setter={() => setter(partClass)}
						key={partClass}
					/>
				)
			}
		</div>
	)
}

const Header = ({setData, setColumnOrder}) => {
	return(
		<div style={{...glob.dottedBackgroundStyle(), padding: '10px', 
			margin: '20px 0px 10px 0px'}}>
			<ClassSelector
				setData={setData}
				setColumnOrder={setColumnOrder}
			/>
		</div>
	)
}

const TablesComponent = () => {

	const [data, setData] = useState(
		() => getTableData('armUnit')
	)
	const [columnOrder, setColumnOrder] = useState(
		() => getDataColumns(toKind('armUnit'))
	);

	return(
		<>
		<Header 
			setData={setData}
			setColumnOrder={setColumnOrder}
		/>
		<div 
			className='my-scrollbar'
			style={{
				...glob.dottedBackgroundStyle(),
				padding: '15px',
				height: '700px', overflow: 'auto'
			}}
		>
			<DraggableTable data={data} columnOrder={columnOrder} setColumnOrder={setColumnOrder} />
		</div>
		</>
	)
}

export default TablesComponent;