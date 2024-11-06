import { useState, useEffect } from 'react'

import {globPartsData, globPartSlots, capitalizeFirstLetter} from '../Misc/Globals.js'

/*****************************************************************************/

const SlotSelector = ({slot, inactive, border, updateSlot}) => {
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
					updateSlot()
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
					border = {previewPart != null && part['ID'] === previewPart['ID']}
					updatePreview = {
						() => {
							previewACPartsDispatch({slot: slot, id: part['ID']})
							setPreviewPart(part)							
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

const PartStats = ({previewPart, curPart}) => {
	const curPartStats = Object.fromEntries(
		filterEntries(Object.entries(curPart))
	)
	if(previewPart === null) {
		let nullStats = Object.fromEntries(
			Object.entries(curPartStats).map(([k, v]) => [k, null])
		)
		var [leftStats, rightStats] = [nullStats, curPartStats]
	}
	else {
		var previewStats = Object.fromEntries(
			filterEntries(Object.entries(previewPart))
		)
		var [leftStats, rightStats] = [curPartStats, previewStats]
	}

	return (
		<>
		<div style = {{display: 'inline-block', verticalAlign: 'top'}}>
		<table>
		<tbody>
		{
			Object.keys(rightStats).map(
				name => {
					return (
					<tr key={name}>
						<td>{name}</td>
						<td>{leftStats[name]}</td>
						<td>»</td>
						<td>{rightStats[name]}</td>
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

const PartsExplorer = ({slot, setSlot, acParts, acPartsDispatch, previewACPartsDispatch}) => {
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
					inactive = {s === 'booster' && acParts.legs['LegType'] === 'Tank'}
					border = {s === slot}
					updateSlot = {() => {
						setSlot(s)
						setPreviewPart(null)
					}}
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
		<PartStats previewPart={previewPart} curPart={acParts[slot]} />
		</div>
		</>
	)
}

export default PartsExplorer