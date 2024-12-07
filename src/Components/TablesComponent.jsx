import {useState, useReducer, useContext, useRef} from 'react';

import * as glob from '../Misc/Globals.js';
import ModalWrapper from './ModalWrapper.jsx'

/*****************************************************************************/

function getCellStyle(pos, wide, tall, thick, bottomBorder) {
	const width = wide ? '250px' : '150px';
	const borderW = thick ? '5px' : '2px';
	const style = {
		display: 'inline-block',
		verticalAlign: 'top',
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
		style.zIndex = 1;
	}
	if(tall)
		style.height = '80px';
	return style
}

const longDashCharacter = '\u2012';
const doubleArrowRight = '\u00bb';
const doubleArrowLeft = '\u00ab';
const multChar = '\u00d7';

function toCellDisplay(val) {
	if(val === undefined)
		return longDashCharacter;
	else if (typeof val === 'string')
		return val.toUpperCase();
	else if(val.constructor === Array)
		return val[0].toString() + multChar + val[1].toString();
	else
		return val;
}

function getShowShiftSymbols(shiftInfo, pos) {
	if(!shiftInfo.range)
		return [false, false];
	else if(pos >= shiftInfo.range[0] && pos <= shiftInfo.range[1])
		return shiftInfo.posDirection ? [true, false] : [false, true]
	else
		return [false, false];
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

	let [showLeftShift, showRightShift] = getShowShiftSymbols(previewShiftInfo, pos);

	const showSortOrder = sortOrder !== null && !showRightShift;

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
				{{display: 'flex', justifyContent: 'center', height: '100%',
					position: 'relative'}}
			>
				{
					showLeftShift ? 
						<div 
							style={{fontSize: '20px', position: 'absolute', top: '21px',
								right: '90%'}}
						>
							{doubleArrowLeft}
						</div> :
						<></>
				}
				<div 
					style={{height: '100%', width: '70%', display: 'flex', alignItems:'center',
						justifyContent: 'center', whiteSpace: 'normal',
						cursor: pos === 0 ? 'default' : 'grab'}}
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
				{
					showRightShift ? 
						<div 
							style={{fontSize: '20px', position: 'absolute', top: '21px',
								left: '90%'}}
						>
							{doubleArrowRight}
						</div> :
						<></>
				}
				{
					showSortOrder ? 
						<img 
							src={
								sortOrder ? 
									glob.sortIcons.ascend :
									glob.sortIcons.descend
								}
							style={{width: '20px', filter: 'invert(1)', position: 'absolute',
								top: '23px', left: '85%'}} 
						/> :
						<></>
				}
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
		(a, b) => glob.partSortingFunction(sorting.key, sorting.ascend, a, b)
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
		<div style={{display: 'table-row', whiteSpace: 'nowrap', position: 'sticky', top: '0', zIndex: 2}}>
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
									key={colPos}
								/>
							)
						}
					</div>
				)
			}
		</>
	);
};

/*****************************************************************************/

const tableHidddenPartStats = ['Kind', 'Manufacturer', 'LegType', 'GeneratorType', 'RightArm', 
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

function getTableData(partClass) {
	const slotName = toSlotName(partClass);

	const parts = glob.getPartsForSlot(slotName, 0).filter(
		part => part['Name'] !== '(NOTHING)'
	);

	return(
		parts.map(
			part => Object.fromEntries(
				Object.entries(part).filter(
					([name, val]) => !tableHidddenPartStats.includes(name)
				)
			)
		)
	)
}

const tableData = [];
partClasses.map(c => {tableData[c] = getTableData(c); return null})

function getDefaultDataColumns(partClass) {
	const dataKeys = tableData[partClass].map(part => Object.keys(part)).flat();
	const uniqueDataKeys = dataKeys.filter((col, pos, allKeys) => allKeys.indexOf(col) === pos);
	// We could just return uniqueDataKeys, but using the global list gives us a nicer 
	// default ordering
	let res = glob.partStatGroups[toKind(partClass)].flat();
	res.unshift('Name');
	res = res.filter(col => uniqueDataKeys.includes(col));
	return res
}

const defaultDataColumns = [];
partClasses.map(c => {defaultDataColumns[c] = getDefaultDataColumns(c); return null})

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

const ClassSelector = ({selectedClass, setSelectedClass, setData, setColumnOrder}) => {

	const setter = (partClass) => {
		setSelectedClass(partClass);
		setColumnOrder(defaultDataColumns[partClass]);
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

const TablesHeader = ({columnOrder, selectedClass, unitFilters, setUnitFilters, setSelectedClass, setColumnOrder}) => {

	const [columnFilterModal, setColumnFilterModal] = useState(false);
	const [unitFilterModal, setUnitFilterModal] = useState(false);

	const closeColumnFilterModal = () => setColumnFilterModal(false);
	const closeUnitFilterModal = () => setUnitFilterModal(false);

	return(
		<div style={{...glob.dottedBackgroundStyle(), display:'flex', padding: '10px', 
			margin: '20px 0px 10px 0px'}}>
			<ClassSelector
				selectedClass={selectedClass}
				setSelectedClass={setSelectedClass}
				setColumnOrder={setColumnOrder}
			/>
			<button 
				onClick={() => setColumnFilterModal(true)}
			>
				FILTER COLUMNS
			</button>
			{
				['armUnit', 'backUnit'].includes(selectedClass) ?
					<button 
						onClick={() => setUnitFilterModal(true)}
					>
						FILTER UNITS
					</button> : 
					<></>
			}
			<ModalWrapper isOpen={columnFilterModal} closeModal={closeColumnFilterModal}>
				{
					columnFilterModal ? 
						<ColumnFilters 
							selectedClass={selectedClass}
							columnOrder={columnOrder}
							closeModal={closeColumnFilterModal}
							setColumnOrder={setColumnOrder}
						/> :
						<></>
				}
			</ModalWrapper>
			<ModalWrapper isOpen={unitFilterModal} closeModal={closeUnitFilterModal}>
				{
					unitFilterModal ? 
						<UnitFilters
							unitFilters={unitFilters}
							setUnitFilters={setUnitFilters}
							closeModal={closeUnitFilterModal}
						/> :
						<></>
				}
			</ModalWrapper>	
		</div>
	)
}

function partitionList(list, subLength) {
	const subLists = [];
	let tempSubList = [];
	let innerIdx = 0;

	list.map(
		colName => {
			if(innerIdx > subLength - 1) {
				subLists.push(tempSubList);
				tempSubList = [];
				innerIdx = 0;
			}
			tempSubList.push(colName);
			innerIdx++;
		}
	);
	for(let i = tempSubList.length - 1; i < subLength - 1; i++)
		tempSubList.push(null)
	subLists.push(tempSubList);

	return subLists;
}

const ColumnFilters = ({selectedClass, columnOrder, setColumnOrder, closeModal}) => {

	const allCols = defaultDataColumns[selectedClass].filter(colName => colName !== 'Name');

	const checkboxes = Object.fromEntries(
		allCols.map(
			c => [c, columnOrder.includes(c)]
		)
	);

	const setAll = val => {
		if(val) {
			const newOrder = allCols;
			newOrder.unshift('Name');
			setColumnOrder(newOrder);
		} else 
			setColumnOrder(['Name'])
	}

	const toggleColumn = name => {
		const newVal = !checkboxes[name];
		let newColumnOrder = [...columnOrder];
		if(newVal)
			newColumnOrder.push(name)
		else
			newColumnOrder = newColumnOrder.filter(colName => colName !== name)
		setColumnOrder(newColumnOrder);
	}

	const rows = partitionList(allCols, 4);

	return(
		<>
		<div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '10px'}}>
			<button onClick={() => setAll(true)}>SELECT ALL</button>
			<button onClick={() => setAll(false)}>DESELECT ALL</button>
		</div>
		<div className="my-scrollbar" 
			style={{maxHeight: '700px', overflowY: 'auto'}}
		>		
		<table style={{borderCollapse: 'collapse'}}>
		<tbody>
		{
			rows.map(
				row => <tr key={row}>
					{
						row.map(
							name => name ?
							 <td 
								style={{width: '180px', height: '50px', verticalAlign: 'middle', 
									border: 'solid 2px ' + glob.paletteColor(4)}}
								key={name}
							>
								<div style={{display: 'flex', padding: '5px'}}>
									<label style={{width: '80%'}} htmlFor={name}>
										{glob.toDisplayString(name)}
									</label>
									<input
										type="checkbox"
										style={{width: '20%', height: '30%', margin: 'auto'}}
										id={name}
										checked={checkboxes[name]}
										onChange={() => toggleColumn(name)}
									/>
								</div>
							</td> :
							null
						)
					}
				</tr>
			)
		}
		</tbody>
		</table>
		<button 
			style={{display: 'block', width: 'fit-content', margin: '10px auto'}}
			onClick={closeModal}
		>
			BACK (ESC)
		</button>
		</div>
		</>
	)
}

const unitFilterKeys = {
	'AttackType': ['Explosive', 'Energy', 'Kinetic', 'Coral'],
	'WeaponType': ['Burst', 'Charge', 'Melee', 'Homing', 'Semi-Auto', 'Full-Auto', 'Shield'],
	'ReloadType': ['Single Shot', 'Overheat', 'Magazine'],
	'AdditionalEffect': ['ACS Failure', 'Camera Disruption', 'Shock', 'NoEffect']
};

const unitFilterIcons = {};
Object.keys(unitFilterKeys).map(
	group => {
		unitFilterIcons[group] = {};
		unitFilterKeys[group].map(
			key => unitFilterIcons[group][key] = glob.unitIcons[key + '.png']
		)
	}
)

const FilterGroup = ({group, checkboxes, unitFilters, setUnitFilters}) => {

	const rows = partitionList(Object.entries(unitFilterIcons[group]), 2);

	const toggleKey = name => {
		const newVal = !checkboxes[name];
		const newFilters = {...unitFilters};
		if(newVal)
			newFilters[group] = newFilters[group].filter(keyName => keyName !== name)
		else
			newFilters[group].push(name)
		setUnitFilters(newFilters);
	}

	return(
		<div>
			<div style={{width: 'fit-content', margin: '0px auto 10px auto'}}>
				{glob.toDisplayString(group)}
			</div>
			{
				rows.map(
					row => <div 
						style={{display: 'flex', gap: '15px', marginBottom: '3px'}}
						key={row}
					>
						{
							row.map(
								val => val ?
									<div
										style={{display: 'flex', alignItems: 'center'}}
										key={val[0]}
									>
										<img src={val[1]} style={{width: '20px'}} />
										<label 
											style={{width: '100px', paddingLeft: '5px'}}
											htmlFor={val[0]}
										>
											{glob.toDisplayString(val[0])}
										</label>
										<input
											type="checkbox"
											style={{}}
											id={val[0]}
											checked={checkboxes[val[0]]}
											onChange={() => toggleKey(val[0])}
										/>
									</div> : 
									null
							)
						}
					</div>
				)
			}
		</div>
	)
}

const UnitFilters = ({closeModal, unitFilters, setUnitFilters}) => {

	const checkboxes = Object.fromEntries(
		Object.keys(unitFilterKeys).map(
			group => [
				group,
				Object.fromEntries(
					unitFilterKeys[group].map(
						key => [key, !unitFilters[group].includes(key)]
					)
				)
			]
		)
	);

	const setAll = val => {
		if(val){
			const newFilters = Object.fromEntries(
				Object.keys(unitFilterKeys).map(group => [group, []])
			);
			setUnitFilters(newFilters);
		} else
			setUnitFilters(unitFilterKeys);
	}

	const cellStyle = {border: 'solid 2px ' + glob.paletteColor(4), padding: '10px'};

	const rows = partitionList(Object.keys(unitFilterKeys), 2);

	return(
		<>
		<div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '10px'}}>
			<button onClick={() => setAll(true)}>SELECT ALL</button>
			<button onClick={() => setAll(false)}>DESELECT ALL</button>
		</div>		
		<table style={{borderCollapse: 'collapse'}}><tbody>
		{
			rows.map(
				row => <tr>
					{
						row.map(
							group => <td style={cellStyle}>
								<FilterGroup 
									group={group}
									unitFilters={unitFilters}
									checkboxes={checkboxes[group]}
									setUnitFilters={setUnitFilters}
								/>
							</td>
						)
					}
				</tr>
			)
		}
		</tbody></table>
		<button 
			style={{display: 'block', width: 'fit-content', margin: '10px auto'}}
			onClick={closeModal}
		>
			BACK (ESC)
		</button>
		</>
	)
}

const TablesComponent = () => {

	const [selectedClass, setSelectedClass] = useState('armUnit');

	const [columnOrder, setColumnOrder] = useState(
		() => defaultDataColumns['armUnit']
	);

	const [unitFilters, setUnitFilters] = useState(
		() => Object.fromEntries(Object.keys(unitFilterKeys).map(group => [group, []]))
	);

	let data = tableData[selectedClass];

	if(['armUnit', 'backUnit'].includes(selectedClass)) {
		Object.keys(unitFilters).map(group => unitFilters[group].map(
			key => {
				data = data.filter(part => 
					key === 'NoEffect' ?
						part[group] !== undefined :
						part[group] !== key
				)
			}
		));
	}

	return(
		<>
		<TablesHeader 
			columnOrder={columnOrder}
			selectedClass={selectedClass}
			unitFilters={unitFilters}
			setUnitFilters={setUnitFilters}
			setSelectedClass={setSelectedClass}
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