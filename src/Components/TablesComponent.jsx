import {useState, useReducer, useContext, useRef} from 'react';

import * as glob from '../Misc/Globals.js';

function getCellStyle(pos, wide, tall, thick, bottomBorder) {
	const width = wide ? '250px' : '150px';
	const borderW = thick ? '5px' : '2px';
	const style = {
		display: 'inline-block',
		width: width,
		padding: '5px 10px 5px 10px',
		boxSizing: 'border-box',
		borderRightWidth: borderW,
		borderRightStyle: 'solid',
		borderLeftColor: glob.paletteColor(5), borderRightColor: glob.paletteColor(5),
		textAlign: 'center'			
	};
	if(bottomBorder) {
		style.borderBottomWidth = '2px';
		style.borderBottomStyle = style.borderRightStyle;	
		style.borderBottomColor = style.borderRightColor;		
	}
	if(pos === 0 || thick) {
		style.borderLeftWidth = style.borderRightWidth;
		style.borderLeftStyle = style.borderRightStyle;
		style.borderLeftColor = style.borderRightColor;
	}
	if(pos === 0) {
		style.position = 'sticky';
		style.left = 0;
	}
	if(tall)
		style.height = '80px';
	return style
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

const ColumnHeader = ({name, pos, sortOrder, previewShiftInfo, changeOrdering, dragHandler, changeSorting}) => {

	const [isBeingDragged, setIsBeingDragged] = useState(false);

	let handleDragStart, handleDragEnd, handleDragEnter, handleDragLeave, handleDragOver,
		handleDrop;
	if(pos === 0)
		handleDragStart = handleDragEnd = handleDragEnter = handleDragLeave = handleDragOver 
			= handleDrop = () => {};
	else {
		handleDragStart = (event) => {
			event.dataTransfer.setData(JSON.stringify(pos), pos);
			setIsBeingDragged(true);
		};

		handleDragEnd = (event) => {
			setIsBeingDragged(false);
		};

		handleDragEnter = (event) =>  {
			const srcPos = Number(event.dataTransfer.types[0]);
			if(srcPos < pos)
				dragHandler({range: [srcPos + 1, pos], posDirection: true}, pos);
			else if(srcPos > pos)
				dragHandler({range: [pos, srcPos - 1], posDirection: false}, pos);
		}

		handleDragLeave = (event) =>  {
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

		handleDragOver = (event) => {
			event.preventDefault();
		}

		handleDrop = (event) => {
			event.preventDefault();
			const srcPos = Number(event.dataTransfer.types[0]);
			if(srcPos !== pos) {
				dragHandler({range: null, posDirection: true});
				changeOrdering(srcPos, pos);
			}
		};
	}

	let [leftVisibility, rightVisibility] = getShiftSymbolsVisibility(previewShiftInfo, pos);

	let rightSymbol;
	let isSortOrder = false;
	if(rightVisibility === 'visible' || sortOrder == null) {
		rightSymbol = doubleArrowRight;
	}
	else if(sortOrder) {
		isSortOrder = true;
		rightVisibility = 'visible';
		rightSymbol = glob.sortIcons.ascend;
	}
	else {
		isSortOrder = true;
		rightVisibility = 'visible';
		rightSymbol = glob.sortIcons.descend;
	}

	let rangeEndpoint = null;
	if(previewShiftInfo.range) {
		rangeEndpoint = previewShiftInfo.posDirection ? previewShiftInfo.range[1] :
			previewShiftInfo.range[0]
	}

	const cellBaseStyle = getCellStyle(pos, name === 'Name', true, 
		pos === rangeEndpoint, false);
	const color = getHeaderColor(previewShiftInfo.range, rangeEndpoint, pos);

	const cellStyle = {
		...cellBaseStyle,
		backgroundColor: color,
		padding: '5px 0px',
		borderTop: '2px solid ' + glob.paletteColor(5),
		borderBottom: '2px solid ' + glob.paletteColor(5),
		filter: isBeingDragged ? 'brightness(0.6)' : 'none'
	};

	return (
		<div 
			style={cellStyle}
		>
			<div style=
				{{display: 'flex', justifyContent: 'center', alignItems: 'center', 
					height: '100%'}}
			>
				<div 
					style={{height: '100%', width: '10%', visibility: leftVisibility, 
						display: 'flex', alignItems:'center', justifyContent: 'center', 
						cursor: 'default', fontSize: '20px'}}
				>
					{doubleArrowLeft}
				</div>
				<div 
					style={{height: '100%', width: '80%', display: 'flex', alignItems:'center',
						justifyContent: 'center', cursor: pos === 0 ? 'default' : 'grab',
						whiteSpace: 'normal'}}
					draggable={pos !== 0}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onClick={() => changeSorting(name)}
				>
					{glob.toDisplayString(name)}
				</div>
				<div 
					style={{height: '100%', width: '10%', visibility: rightVisibility,
						display: 'flex', alignItems:'center', justifyContent: 'center', 
						cursor: 'default', fontSize: '20px', position: 'relative'}}
				>
					{
						isSortOrder ? 
							<img 
								src={rightSymbol}
								style={{width: '20px', filter: 'invert(1)', position: 'absolute',	
									right: '0px'}} 
							/> :
							rightSymbol
					}
				</div>
			</div>
		</div>
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

export function stickyRowBackground(pos) {
	if(pos % 2)
		return glob.paletteColor(4, 1, 0.95);
	else
		return glob.paletteColor(2);
}

const TableCell = ({content, rowPos, colPos, colName, rangeEndpoint, bottomBorder}) => {
	const color = colPos === 0 ? stickyRowBackground(rowPos) : glob.tableRowBackground(rowPos);
	return(
		<div 
			style={
				{
					...getCellStyle(colPos, colName === 'Name', false, 
						colPos === rangeEndpoint, bottomBorder),
					backgroundColor: color
				}
			}
			key={colName}
		>
			{toCellDisplay(content)}
		</div>
	)
}

const DraggableTable = ({data, columnOrder, setColumnOrder}) => {

	const [sorting, setSorting] = useState({key: 'Name', ascend: true});
	const [previewShiftInfo, setPreviewShiftInfo] = useState({range: null, posDirection: true});

	let sortedData = data;
	sortedData.sort(
		(a, b) => {
			const order = sorting.ascend ? 1 : -1;
			// Default is set so that parts without the key will always come after the others
			const defaultVal = order === 1 ? Infinity : -Infinity;
			let aVal = a[sorting.key] || defaultVal;
			let bVal = b[sorting.key] || defaultVal;
			// Resolve list specs
			if (aVal.constructor === Array) aVal = aVal[0] * aVal[1];
			if (bVal.constructor === Array) bVal = bVal[0] * bVal[1];
			// Sort alphabetically is key is equal
			let res;
			if(aVal > bVal)      
				res = order;
			else if(aVal < bVal)
				res = -order;
			else
				res = a['Name'] > b['Name'] ? order : -order;
			return res
		}
	);

	const changeSorting = key => {
		const newAscend = key === sorting.key ? !sorting.ascend : true;
		setSorting({key: key, ascend: newAscend})
	}

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
		<>
		<div style={{display: 'table-row', whiteSpace: 'nowrap', position: 'sticky', top: '0', zIndex: 1}}>
			{
				columnOrder.map(
					(name, pos) => <ColumnHeader
						name={name}
						pos={pos}
						sortOrder={sorting.key === name ? sorting.ascend : null}
						previewShiftInfo={previewShiftInfo}
						dragHandler={dragHandler}
						changeOrdering={changeOrdering}
						changeSorting={changeSorting}
						key={name}
					/>
				)
			}
		</div>
			{
				sortedData.map(
					(row, rowPos) => <div 
						style={{display: 'table-row', whiteSpace: 'nowrap'}}
						key={rowPos}
					>
						{
							columnOrder.map(
								(name, colPos) => <TableCell
									content={toCellDisplay(row[name])}
									rowPos={rowPos}
									colPos={colPos}
									colName={name}
									rangeEndpoint={rangeEndpoint}
									bottomBorder={rowPos === data.length - 1}
								/>
							)
						}
					</div>
				)
			}
		</>
	);
};

const tableHidddenPartStats = ['Kind', 'Manufacturer', 'AttackType', 
	'WeaponType', 'ReloadType', 'AdditionalEffect', 'LegType', 'GeneratorType', 'RightArm', 
	'LeftArm', 'RightBack', 'LeftBack','ID'];

const partClasses = ['armUnit', 'backUnit', 'head', 'core', 'arms', 'legs', 'booster',
	'fcs', 'generator', 'expansion'];

function toSlotName(className) {
	if(className === 'armUnit')
		return 'leftArm';
	else if (className === 'backUnit')
		return 'leftBack'
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

function getDataColumns(kind, data) {
	const dataKeys = data.map(part => Object.keys(part)).flat();
	const uniqueDataKeys = dataKeys.filter((col, pos, allKeys) => allKeys.indexOf(col) === pos);
	// We could just return uniqueDataKeys, but using from the global list gives us a nicer 
	// default ordering
	let res = glob.partStatGroups[kind].flat();
	res.unshift('Name');
	res = res.filter(col => uniqueDataKeys.includes(col));
	return res
}

const ClassSelector = ({setData, setColumnOrder}) => {
	const [selectedClass, setSelectedClass] = useState('armUnit');

	const setter = (partClass) => {
		const data = getTableData(partClass);
		setSelectedClass(partClass);
		setData(data);
		setColumnOrder(getDataColumns(toKind(partClass), data));
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
		() => getDataColumns(toKind('armUnit'), getTableData('armUnit'))
	);

	return(
		<>
		<Header 
			setData={setData}
			setColumnOrder={setColumnOrder}
		/>
		<div 
			style={{
				...glob.dottedBackgroundStyle(),
				boxSizing: 'border-box',
				width: '100%',
				padding: '15px'
			}}
		>
			<div className='my-scrollbar' style={{height: '700px', overflow: 'auto',
				width: 'fit-content', maxWidth: '100%', margin: '0px auto'}}>
				<DraggableTable
					data={data}
					columnOrder={columnOrder}
					setColumnOrder={setColumnOrder}
				/>
			</div>
		</div>
		</>
	)
}

export default TablesComponent;