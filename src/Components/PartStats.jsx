import { useContext } from 'react';

import {ACPartsContext} from "../Contexts/ACPartsContext.jsx";
import {NumericRow} from './StatRows.jsx';
import * as glob from '../Misc/Globals.js';

function filterPartStats(stats) {
	let entries = Object.entries(stats);
	let filteredEntries = entries.filter(
		([prop, val]) => !glob.hidddenPartStats.includes(prop)
	);
	return Object.fromEntries(filteredEntries)
}

function toNullStats(part) {
	return Object.fromEntries(
		Object.entries(part).map(([k, v]) => [k, null])
	)
}

const UnitIcon = ({img}) => {
	return <img src={img} width='20px' 
		style={{margin: '0px 2px', border: 'solid 1px gray'}} />
}

const PartStatsHeader = ({part}) => {
	let desc;

	if(part['Kind'] === 'Unit' && part['ID'] !== glob.noneUnit['ID']) {
		desc = part['Description']
	}
	else
		desc = part['Kind']

	const manufacturerLogo = glob.manufacturerLogos[part['Manufacturer'] + '.png']

	return(
		<div style={{...glob.dottedBackgroundStyle(), ...{height: 80}}}>
			<div style={{display: 'inline-block', paddingTop: 20, paddingLeft: 10}}>
				<div>{desc.toUpperCase()}</div>
				<div style={{fontSize: '160%'}}>{part['Name']}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right', paddingRight: 10}}>
				<img style={{display: 'block'}} src={manufacturerLogo} width='80px' />
			</div>
		</div>
	)
}

const PartStatsBody = ({leftPart, rightPart}) => {
	const leftFiltered = filterPartStats(leftPart)
	const rightFiltered = filterPartStats(rightPart)
	
	const isUnit = rightPart['Kind'] === 'Unit' && rightPart['ID'] !== glob.noneUnit['ID']
	if(isUnit) {
		var atkTypeImg = glob.unitIcons[rightPart['AttackType'] + '.png'];
		var wpnTypeImg = glob.unitIcons[rightPart['WeaponType'] + '.png'];
		var rldTypeImg = glob.unitIcons[rightPart['ReloadType'] + '.png'];
		var addEffImg;
		if(rightPart['AdditionalEffect'] === undefined)
			addEffImg = glob.unitIcons['NoEffect.png']
		else
			addEffImg = glob.unitIcons[rightPart['AdditionalEffect'] + '.png'];		
	}

	return(
		<div style={{...glob.dottedBackgroundStyle(), ...{padding: 15}}}>
			<div style={{display: 'inline-block', fontSize: '12px', 
				padding: '0px 0px 10px 10px'}}>
				{glob.boxCharacter + ' PART SPECS'}
			</div>
			{
				isUnit ? 
					<div style={{display: 'inline-block', marginLeft: 410}}>
						<UnitIcon img={atkTypeImg} />
						<UnitIcon img={wpnTypeImg} />
						<UnitIcon img={rldTypeImg} />
						<UnitIcon img={addEffImg} />
					</div> :
				<></>
			}
		<div className="my-scrollbar" style={{maxHeight: '625px', overflowY: 'auto'}}>
			{
				Object.keys(rightFiltered).map(
					(name, pos) => {		
						return(
							<div style={{background: glob.tableRowBackground(pos)}} key={pos}>
								<NumericRow 
									name = {name}
									leftRaw = {leftFiltered[name]}
									rightRaw = {rightFiltered[name]}
									kind = {rightPart['Kind']}
									key = {name}
								/>
							</div>
						)
					}
				)
			}
		</div>
		</div>
	)
}

const PartStats = ({preview}) => {

	const previewPart = preview.part;
	const curPart = useContext(ACPartsContext).current[preview.slot];

	if(previewPart === null) {
		let nullPart = toNullStats(curPart);
		var [leftPart, rightPart] = [nullPart, curPart];
	}
	else {
		var [leftPart, rightPart] = [curPart, previewPart];
	}

	return (
		<>
		<div style={{marginBottom: 10}}>
			<PartStatsHeader part={rightPart} />
		</div>
		<PartStatsBody leftPart={leftPart} rightPart={rightPart} />
		</>
	);
}

export default PartStats;