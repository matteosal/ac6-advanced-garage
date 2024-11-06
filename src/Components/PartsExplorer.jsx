import { useState, useEffect } from 'react'

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

const PartSelector = ({part, border, updatePreview, clearPreview, updateAssembly}) => {
	let style = {}
	if(border)
		style['border'] = 'solid'
	return (
		<div 
			style = {style}
			onMouseEnter = {updatePreview}
			onMouseLeave = {clearPreview}
			onClick = {updateAssembly}
		>
		{part.Name}
		</div>
	)
}

const PartList = (params) => {
	const {slot, updateAssembly, previewACPartsDispatch, previewPart, setPreviewPart} = params
	const style = {
		display: 'inline-block',
		verticalAlign: 'top',
		height: '500px',
		overflowY: 'auto'
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
					updatePreview = {
						() => {
							previewACPartsDispatch({slot: slot, id: part['ID']})
							setPreviewPart(part['ID'])							
						}
					}
					clearPreview = {
						() => {
							previewACPartsDispatch({setNull: true})
							setPreviewPart(null)
						}
					}
					updateAssembly = {() => updateAssembly(part['ID'])}
					key = {part['ID']}
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

const PartsExplorer = ({slot, setSlot, isTank, acPartsDispatch, previewACPartsDispatch}) => {
	const [previewPart, setPreviewPart] = useState(null)

	const handleKeyDown = (event) => {
		if(event.key == 'Escape')
			setSlot(null)
	}

	useEffect(() => {
			document.addEventListener('keydown', handleKeyDown)
			return () => document.removeEventListener('keydown', handleKeyDown)
		},
		[]
	)

	return (
		<>
		{
			globPartSlots.map(
				(s) => <SlotSelector 
					slot = {s}
					inactive = {s === 'booster' && isTank}
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
			slot = {slot}
			updateAssembly = {
				(partID)  => {
					acPartsDispatch({slot: slot, id: partID})
					previewACPartsDispatch({setNull: true})
					// setting the slot to null closes the explorer and shows the assembly
					setSlot(null)							
				}				
			}
			previewACPartsDispatch = {previewACPartsDispatch}
			previewPart = {previewPart}
			setPreviewPart = {setPreviewPart}
		/>
		<PartStats id={previewPart} />
		</div>
		</>
	)
}

export default PartsExplorer