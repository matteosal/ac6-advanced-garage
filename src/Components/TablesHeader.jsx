import {useState, useContext} from 'react';

import * as glob from '../Misc/Globals.js';

import {TablesStateContext, TablesStateDispatchContext} from 
	'../Contexts/TablesStateContext.jsx'

import ModalWrapper from './ModalWrapper.jsx'

/*****************************************************************************/

const ClassBox = ({partClass, selected, setter}) => {
	const [highlighted, setHighlighted] = useState(false);

	const imgStyle = {width: '60px'};
	if(selected)
		imgStyle['filter'] = 'brightness(1.6)';
	else if(highlighted)
		imgStyle['filter'] = 'brightness(1.3)';

	const img = glob.slotImages[glob.toImageFileName(glob.toSlotName(partClass))];
	return (
		<div 
			style={{display: 'inline-block'}}
			onMouseEnter={() => setHighlighted(true)}
			onMouseLeave={() => setHighlighted(false)}
			onClick={setter}
		>
			<img src={img} alt={partClass} style={imgStyle}/>
		</div>
	)
}

function toDisplayedPartClass(partClass) {
	if(partClass === 'armUnit')
		return 'ARM UNIT';
	if(partClass === 'backUnit')
		return 'BACK UNIT';
	else
		return partClass.toUpperCase()
}

const ClassSelector = () => {

	const selectedClass = useContext(TablesStateContext).selectedClass;
	const stateDispatch = useContext(TablesStateDispatchContext);

	const setter = (partClass) => {
		stateDispatch({target: 'selectedClass', value: partClass});
	}

	return(
		<div style={{alignItems: 'center'}}>
			<div style={{width: 'fit-content', margin: '0px auto', paddingBottom: '5px'}}>
				{toDisplayedPartClass(selectedClass)}
			</div>
			{
				glob.partClasses.map(
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

const TablesHeader = () => {

	const selectedClass = useContext(TablesStateContext).selectedClass;

	const [columnFilterModal, setColumnFilterModal] = useState(false);
	const [unitFilterModal, setUnitFilterModal] = useState(false);

	const closeColumnFilterModal = () => setColumnFilterModal(false);
	const closeUnitFilterModal = () => setUnitFilterModal(false);

	return(
		<div style={{...glob.dottedBackgroundStyle(), display:'flex', justifyContent: 'center',
			alignItems: 'center', gap: '30px', padding: '10px 0px 5px 0px', 
			margin: '20px 0px 10px 0px'}}>
			<button 
				onClick={() => setColumnFilterModal(true)}
			>
				FILTER COLUMNS
			</button>
			<ClassSelector />
			<button
				style={{
					visibility: ['armUnit', 'backUnit'].includes(selectedClass) ? 
						'visible' : 'hidden'
				}}
				onClick={() => setUnitFilterModal(true)}
			>
				FILTER UNITS
			</button> 
			<ModalWrapper isOpen={columnFilterModal} closeModal={closeColumnFilterModal}>
				{
					columnFilterModal ? 
						<ColumnFilters closeModal={closeColumnFilterModal} /> :
						<></>
				}
			</ModalWrapper>
			<ModalWrapper isOpen={unitFilterModal} closeModal={closeUnitFilterModal}>
				{
					unitFilterModal ? 
						<UnitFilters closeModal={closeUnitFilterModal} /> :
						<></>
				}
			</ModalWrapper>	
		</div>
	)
}

const ColumnFilters = ({closeModal}) => {

	const state = useContext(TablesStateContext);
	const stateDispatch = useContext(TablesStateDispatchContext);

	const selectedClass = state.selectedClass;
	const columnOrder = state.columnOrder[selectedClass];

	const allCols = glob.defaultTableColumns[selectedClass].filter(
		colName => colName !== 'Name'
	);

	const checkboxes = Object.fromEntries(
		allCols.map(
			c => [c, columnOrder.includes(c)]
		)
	);

	const setAll = val => {
		if(val) {
			const newOrder = allCols;
			newOrder.unshift('Name');
			stateDispatch({target: 'columnOrder', partClass: selectedClass, value: newOrder});
		} else 
			stateDispatch({target: 'columnOrder', partClass: selectedClass, value: ['Name']});
	}

	const toggleColumn = name => {
		const newVal = !checkboxes[name];
		let newOrder = [...columnOrder];
		if(newVal)
			newOrder.push(name);
		else
			newOrder = newOrder.filter(colName => colName !== name);
		stateDispatch({target: 'columnOrder', partClass: selectedClass, value: newOrder});
	}

	const rows = glob.partitionList(allCols, 4);

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

const unitFilterIcons = {};
Object.keys(glob.allUnitFilters).map(
	group => {
		unitFilterIcons[group] = {};
		glob.allUnitFilters[group].map(
			key => unitFilterIcons[group][key] = glob.unitIcons[key + '.png']
		);
		return null;
	}
)

const FilterGroup = ({group, checkboxes}) => {

	const state = useContext(TablesStateContext);
	const stateDispatch = useContext(TablesStateDispatchContext);

	const selectedClass = state.selectedClass;	
	const unitFilters = state.unitFilters[selectedClass];

	const rows = glob.partitionList(Object.entries(unitFilterIcons[group]), 2);

	const toggleKey = name => {
		const newVal = !checkboxes[name];
		const newFilters = {...unitFilters};
		if(newVal)
			newFilters[group] = newFilters[group].filter(keyName => keyName !== name)
		else
			newFilters[group].push(name)
		stateDispatch({target: 'unitFilters', partClass: selectedClass, value: newFilters});
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
										<img src={val[1]} alt={val[0]} style={{width: '20px'}} />
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

const UnitFilters = ({closeModal}) => {

	const state = useContext(TablesStateContext);
	const stateDispatch = useContext(TablesStateDispatchContext);

	const selectedClass = state.selectedClass;	
	const unitFilters = state.unitFilters[selectedClass];

	const checkboxes = Object.fromEntries(
		Object.keys(glob.allUnitFilters).map(
			group => [
				group,
				Object.fromEntries(
					glob.allUnitFilters[group].map(
						key => [key, !unitFilters[group].includes(key)]
					)
				)
			]
		)
	);

	const setAll = val => {
		if(val){
			const newFilters = Object.fromEntries(
				Object.keys(glob.allUnitFilters).map(group => [group, []])
			);
			stateDispatch({target: 'unitFilters', partClass: selectedClass, value: newFilters});
		} else
			stateDispatch({
				target: 'unitFilters',
				partClass: selectedClass,
				value: glob.allUnitFilters
			});
	}

	const cellStyle = {border: 'solid 2px ' + glob.paletteColor(4), padding: '10px'};

	const rows = glob.partitionList(Object.keys(glob.allUnitFilters), 2);

	return(
		<>
		<div style={{display: 'flex', justifyContent: 'space-around', marginBottom: '10px'}}>
			<button onClick={() => setAll(true)}>SELECT ALL</button>
			<button onClick={() => setAll(false)}>DESELECT ALL</button>
		</div>		
		<table style={{borderCollapse: 'collapse'}}><tbody>
		{
			rows.map(
				row => <tr key={row}>
					{
						row.map(
							group => <td style={cellStyle} key={group}>
								<FilterGroup 
									group={group}
									checkboxes={checkboxes[group]}
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

export default TablesHeader;