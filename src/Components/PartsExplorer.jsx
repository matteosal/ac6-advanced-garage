import { useState } from 'react'

import {globPartsData, globPartSlots} from '../Misc/Globals.js'

/*****************************************************************************/

const SlotSelector = ({slot, border, setSlot, setPreviewPart}) => {
	let style = {display : 'inline-block', margin: '8px'}
	if(border)
		style['border'] = 'solid'
	return (
		<div 
			style = {style}
			onMouseEnter = {() => {
					setSlot(slot)
					setPreviewPart(null)
			}}
		>
		{slot}
		</div>
	)
}

/*****************************************************************************/

function setAssemblyPartSingle(assemblyPartsDispatch, id, slot, setSlot) {
	assemblyPartsDispatch({slot: slot, id: id})
	setSlot(null)
}

const PartSelector = ({part, setPreviewPart, updateAssembly}) => {
	return (
		<div 
			onMouseEnter = {() => setPreviewPart(part.ID)}
			onClick = {updateAssembly}
		>
		{part.Name}
		</div>
	)
}

const PartList = ({slot, setSlot, assemblyPartsDispatch, setPreviewPart}) => {
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
	if(['Right Arm', 'Left Arm', 'Right Shoulder', 'Left Shoulder'].includes(slot)) {
		/* Removes the whitespace in slot to perform key lookup of the RightArm, etc fields */
		filterFunc = (part) => (part.Kind === 'Unit' && part[slot.replace(/\s/g, "")]);
	} else {
		filterFunc = (part) => (part.Kind === slot)
	}
	let filteredData = globPartsData.filter(filterFunc);

	return(
		<>
		<div style = {style}>
		{
			filteredData.map(
				(part) => <PartSelector
					part = {part}
					setPreviewPart = {setPreviewPart}
					updateAssembly = {
						() => setAssemblyPartSingle(
							assemblyPartsDispatch,
							part.ID,
							slot,
							setSlot
						)
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

const PartsExplorer = ({slot, setSlot, assemblyPartsDispatch}) => {
	const [previewPart, setPreviewPart] = useState(null)

	return (
		<>
		{
			globPartSlots.map(
				(s) => <SlotSelector 
					slot = {s}
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
			setPreviewPart={setPreviewPart}
		/>
		<PartStats id={previewPart} />
		</div>
		</>
	)
}

export default PartsExplorer