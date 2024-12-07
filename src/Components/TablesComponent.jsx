import {useState, useReducer, useContext, useRef} from 'react';

import * as glob from '../Misc/Globals.js';

import {TablesStateContext, TablesStateDispatchContext} from 
	'../Contexts/TablesStateContext.jsx'

import TablesHeader from './TablesHeader.jsx'
import DraggableTable from './DraggableTable.jsx'
import ModalWrapper from './ModalWrapper.jsx'

/*****************************************************************************/

const TablesComponent = () => {

	const state = useContext(TablesStateContext);
	const selectedClass = state.selectedClass;
	const unitFilters = state.unitFilters[selectedClass];

	let data = glob.tableData[selectedClass];

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
		<TablesHeader />
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
				<DraggableTable data={data}/>
			</div>
		</div>
		</>
	)
}

export default TablesComponent;