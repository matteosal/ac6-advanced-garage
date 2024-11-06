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

function getDisplayedParts(slot, searchString) {
	// Get all parts for the slot. This is not smart because it could be precomputed for 
	// every slot
	let slotFilterFunc
	const slotCapitalized = slot == 'fcs' ? 'FCS' : capitalizeFirstLetter(slot)
	if(['rightArm', 'leftArm', 'rightShoulder', 'leftShoulder'].includes(slot)) {
		slotFilterFunc = part => (part.Kind === 'Unit' && part[slotCapitalized]);
	} else if(slot === 'booster') {
		// The None booster exists because of the tank legs but the user should not be allowed
		//to set it manually
		slotFilterFunc = part => (part.Kind === slotCapitalized && part['Name'] != 'None')
	} else {
		slotFilterFunc = part => (part.Kind === slotCapitalized)
	}
	let output = globPartsData.filter(slotFilterFunc)

	const nonePart = output.find(part => part['Name'] === 'None')

	// Filter by user query
	if(searchString != '') {
		const query = searchString.toLowerCase()
		output = output.filter(part => part['Name'].toLowerCase().includes(query))
	}

	// If none part was there before search filter ensure it's still there and put it at
	// the top
	if(nonePart != undefined) {
		output = output.filter(part => part['Name'] != 'None')
		output.unshift(nonePart)
	}

	return output
}

const PartList = (params) => {
	const {slot, setSlot, curPart, acPartsDispatch, previewPart, setPreviewPart,
		searchString, setSearchString} = params

	const style = {
		display: 'inline-block',
		verticalAlign: 'top',
		height: '500px',
		overflowY: 'auto'
	}

	const displayedParts = getDisplayedParts(slot, searchString)

	const drawBorder = part => 
		part['ID'] === curPart['ID'] ||
		(previewPart != null && part['ID'] === previewPart['ID'])		

	const clearPreview = () => {
		setPreviewPart(null)
		acPartsDispatch({target: 'preview', setNull: true})		
	}
	const updatePreview = part => {
		if(part['ID'] != curPart['ID']) {
			setPreviewPart(part)
			acPartsDispatch({target: 'preview', slot: slot, id: part['ID']})
		} else {
			clearPreview()
		}
	}
	const updateAssembly = part => {
		acPartsDispatch({target: 'current', slot: slot, id: part['ID']})
		clearPreview()
		// setting the slot to null closes the explorer and shows the assembly
		setSlot(null)							
	}

	return(
		<>
		<div style = {style}>
		<input value={searchString} onChange={event => setSearchString(event.target.value)}/>
		{
			displayedParts.map(
				(part) => <PartSelector
					part = {part}
					border = {drawBorder(part)}
					updatePreview = {() => updatePreview(part)}
					clearPreview = {clearPreview}
					updateAssembly = {() => updateAssembly(part)}					
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

const PartsExplorer = ({slot, setSlot, acParts, acPartsDispatch}) => {
	const [previewPart, setPreviewPart] = useState(null)
	const [searchString, setSearchString] = useState('')

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
						setSearchString('')
					}}
					key = {s}
				/>
			)
		}
		<br/>
		<div style={{display : 'inline-block', margin: '8px'}}>
		<PartList
			slot = {slot}
			setSlot = {setSlot}
			curPart = {acParts[slot]}
			acPartsDispatch = {acPartsDispatch}
			previewPart = {previewPart}
			setPreviewPart = {setPreviewPart}
			searchString = {searchString}
			setSearchString = {setSearchString}
		/>
		<PartStats previewPart={previewPart} curPart={acParts[slot]} />
		</div>
		</>
	)
}

export default PartsExplorer