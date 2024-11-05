import { useState } from 'react'

import {globPartsData, globPartSlots, capitalizeFirstLetter} from '../Misc/Globals.js'

/*****************************************************************************/

const SlotSelector = ({slot, inactive, border, setSlot, setPreviewPart}) => {
	let style = {display : 'inline-block', margin: '8px'}
	if(border)
		style['border'] = 'solid'
	if(inactive)
		style['color'] = 'gray'
	return (
		<div 
			style = {style}
			onMouseEnter = {() => {
				if(inactive) {
					return
				} else {
					setSlot(slot)
					setPreviewPart(null)
				}
			}}
		>
		{slot}
		</div>
	)
}

/*****************************************************************************/

const PartSelector = ({part, border, setPreviewPart, updateAssembly}) => {
	let style = {}
	if(border)
		style['border'] = 'solid'
	return (
		<div 
			style = {style}
			onMouseEnter = {() => setPreviewPart(part.ID)}
			onMouseLeave = {() => setPreviewPart(null)}
			onClick = {updateAssembly}
		>
		{part.Name}
		</div>
	)
}

const PartList = ({slot, setSlot, assemblyPartsDispatch, previewPart, setPreviewPart}) => {
	const style = {
		display: 'inline-block',
		verticalAlign: 'top',
		height: '500px',
		overflowY: 'auto'
	}

	if(slot === null) {
		return
	}

	let filterFunc
	const slotCapitalized = slot == 'fcs' ? 'FCS' : capitalizeFirstLetter(slot)
	if(['rightArm', 'leftArm', 'rightShoulder', 'leftShoulder'].includes(slot)) {
		/* Removes the whitespace in slot to perform key lookup of the RightArm, etc fields */
		filterFunc = part => (part.Kind === 'Unit' && part[slotCapitalized]);
	} else if(slot === 'booster') {
		filterFunc = part => (part.Kind === slotCapitalized && part['Name'] != 'None')
	} else {
		filterFunc = part => (part.Kind === slotCapitalized)
	}
	let filteredData = globPartsData.filter(filterFunc);

	return(
		<>
		<div style = {style}>
		{
			filteredData.map(
				(part) => <PartSelector
					part = {part}
					border = {part['ID'] === previewPart}
					setPreviewPart = {setPreviewPart}
					updateAssembly = {
						() => {
							assemblyPartsDispatch({slot: slot, id: part.ID})
							// setting the slot to null closes the explorer and shows the assembly
							setSlot(null)							
						}
					}
					key = {part.ID}
				/>
			)
		}
		</div>
		</>
	)
}

/*****************************************************************************/

const hidddenProps = ['Name', 'Kind', 'RightArm', 'LeftArm', 'RightShoulder', 
  'LeftShoulder','ID']

function filterEntries(entries) {
	return entries.filter(([prop, val]) =>  !hidddenProps.includes(prop))
} 

const PartStats = ({id}) => {
	if(id === null) {
		return
	}
	return (
		<>
		<div style = {{display: 'inline-block', verticalAlign: 'top'}}>
		<table>
		<tbody>
		{
			filterEntries(Object.entries(globPartsData[id])).map(
				([prop, val]) => {
					return (
					<tr key={prop}>
						<td>{prop}</td>
						<td>{val}</td>
					</tr>
					)
				}
			)
		}
		</tbody>
		</table>
		</div>
		</>
	)
}

/*****************************************************************************/

const PartsExplorer = ({slot, setSlot, assemblyParts, assemblyPartsDispatch}) => {
	const [previewPart, setPreviewPart] = useState(null)

	return (
		<>
		{
			globPartSlots.map(
				(s) => <SlotSelector 
					slot = {s}
					inactive = {s === 'booster' && assemblyParts.legs['LegType'] === 'Tank'}
					border = {s === slot}
					setSlot = {setSlot}
					setPreviewPart = {setPreviewPart}
					key = {s}
				/>
			)
		}
		<br/>
		<div style={{display : 'inline-block', margin: '8px'}}>
		<PartList
			slot={slot}
			setSlot={setSlot}
			assemblyPartsDispatch={assemblyPartsDispatch}
			previewPart={previewPart}
			setPreviewPart={setPreviewPart}
		/>
		<PartStats id={previewPart} />
		</div>
		</>
	)
}

export default PartsExplorer