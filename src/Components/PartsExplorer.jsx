import { useState } from 'react'

import {partsData, partSlots} from '../Globals.js'

/*****************************************************************************/

const SlotSelector = ({slot, border, setSlot, partSetter}) => {
	let style = {display : 'inline-block', margin: '8px'}
	if(border)
		style['border'] = 'solid'
	return (
		<div 
			style = {style}
			onMouseEnter = {() => {
					setSlot(slot)
					partSetter(null)
			}}
		>
		{slot}
		</div>
	)
}

/*****************************************************************************/

const PartSelector = ({name, id, setter}) => {
	return (
		<div onMouseEnter = {() => setter(id)}>{name}</div>
	)
}

const PartList = ({slot, setter}) => {
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
	let filteredData = partsData.filter(filterFunc);

	return(
		<>
		<div style = {style}>
		{
			filteredData.map(
				(part) => <PartSelector
					name={part.Name} 
					id={part.ID} 
					setter={setter} 
					key={part.ID}
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
			filterEntries(Object.entries(partsData[id])).map(
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

const PartsExplorer = ({slot, setSlot}) => {
	const [selectedPart, setSelectedPart] = useState(null)

	return (
		<>
		{
			partSlots.map(
				(s) => <SlotSelector 
					slot = {s}
					border = {s === slot}
					setSlot = {setSlot}
					partSetter = {setSelectedPart}
					key = {s}
				/>
			)
		}
		<br/>
		<div>
		<PartList slot={slot} setter={setSelectedPart} />
		<PartStats id={selectedPart} />
		</div>
		</>
	)
}

export default PartsExplorer