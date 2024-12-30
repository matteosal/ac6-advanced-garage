import {useState, useContext} from 'react';

import * as glob from '../Misc/Globals.js';

import {TablesStateContext, TablesStateDispatchContext} from 
	'../Contexts/TablesStateContext.jsx'

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

function toCellDisplay(val, colName) {
	if(val === undefined)
		return longDashCharacter;
	else if (typeof val === 'string')
		return val.toUpperCase();
	else 
		return glob.toValueAndDisplayNumber(colName, val)[1]
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
		padding: '0px',
		borderTop: '2px solid ' + glob.paletteColor(5),
		borderBottom: '2px solid ' + glob.paletteColor(5),
		filter: isBeingDragged ? 'brightness(0.6)' : 'none',
		cursor: pos === 0 ? 'default' : 'grab'
	};

	return (
		<div 
			style={cellStyle}
			draggable={pos !== 0}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onClick={() => changeSorting(name)}
		>
			<div style=
				{{width: '100%', height: '100%', position: 'relative', pointerEvents: 'none'}}
			>
				{
					showLeftShift ? 
						<div 
							style={{fontSize: '20px', position: 'absolute', top: '21px',
								right: '90%', pointerEvents: 'none'}}
						>
							{doubleArrowLeft}
						</div> :
						<></>
				}
				<div 
					style={{height: '100%', width: '70%', display: 'flex', alignItems:'center',
						justifyContent: 'center', boxSizing: 'border-box', margin: '0px auto', 
						padding: '5px 0px', whiteSpace: 'normal', pointerEvents: 'none'}}
				>
					{glob.toDisplayString(name)}
				</div>
				{
					showRightShift ? 
						<div 
							style={{fontSize: '20px', position: 'absolute', top: '21px',
								left: '90%', pointerEvents: 'none'}}
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
							alt={sortOrder ? 'ascending order' : 'descending order'}
							style={{width: '20px', filter: 'invert(1)', position: 'absolute',
								top: '23px', left: '85%', pointerEvents: 'none'}} 
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
			{content}
		</div>
	)
}

const DraggableTable = ({data}) => {

	const state = useContext(TablesStateContext);
	const stateDispatch = useContext(TablesStateDispatchContext);

	const selectedClass = state.selectedClass;
	const columnOrder = state.columnOrder[selectedClass];
	const sorting = state.sorting[selectedClass];

	const [previewShiftInfo, setPreviewShiftInfo] = useState({range: null, posDirection: true});

	let sortedData = data;
	sortedData.sort(
		(a, b) => glob.partSortingFunction(sorting.key, sorting.ascend, a, b)
	);

	const changeSorting = key => {
		const newAscend = key === sorting.key ? !sorting.ascend : true;
		stateDispatch({
			target: 'sorting',
			partClass: selectedClass,
			value: {key: key, ascend: newAscend}
		})
	}

	const changeOrdering = (srcPos, dstPos) => {
		const newOrder = [...columnOrder];
		const [movedColumn] = newOrder.splice(srcPos, 1);
		newOrder.splice(dstPos, 0, movedColumn);
		stateDispatch({target: 'columnOrder', partClass: selectedClass, value: newOrder});
	};

	const dragHandler = (newInfo, callerPos=null) => setPreviewShiftInfo(
		shiftInfo => {
			const range = shiftInfo.range;
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
									content={toCellDisplay(row[name], name)}
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

export default DraggableTable;