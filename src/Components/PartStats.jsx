import { useContext } from 'react';

import {BuilderPartsContext} from "../Contexts/BuilderPartsContext.jsx";
import {StatRow} from './StatRows.jsx';
import * as glob from '../Misc/Globals.js';

function filterPartKeys(part) {
	let entries = Object.entries(part);
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
	return <img src={img} alt='unit icon' width='20px' 
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
		<div style={{...glob.dottedBackgroundStyle(), ...{height: 70}}}>
			<div style={{display: 'inline-block', paddingTop: 10, paddingLeft: 20}}>
				<div>{desc.toUpperCase()}</div>
				<div style={{fontSize: '160%'}}>{part['Name']}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right', paddingRight: 10}}>
				<img style={{display: 'block'}} alt={part['Manufacturer']} 
					src={manufacturerLogo} width='70px' />
			</div>
		</div>
	)
}

function toRowType(statName) {
	return statName === 'MagDumpTime' ? 'NumericNoComparison' : 'Numeric'
}

const PartStatsBody = ({leftPart, rightPart}) => {
	const leftFiltered = filterPartKeys(leftPart)
	const rightFiltered = filterPartKeys(rightPart)

	let statGroups = glob.partStatGroups[rightPart['Kind']].map(
		group => group.filter(stat => rightFiltered[stat] !== undefined)
	);

	// Consistency check
/*	if(statGroups.flat().length !== Object.keys(rightFiltered).length) {
		window.alert(statGroups.flat().length + '|' + Object.keys(rightFiltered).length)
	}*/

	let leftStats = [];
	let rightStats = [];
	for(let i = 0; i < statGroups.length; i++) {
		statGroups[i].map(
			stat => {
				leftStats.push({name: stat, value: leftFiltered[stat], type: toRowType(stat)});
				rightStats.push({name: stat, value: rightFiltered[stat], type: toRowType(stat)});
				return null;
			}
		);
		if(statGroups[i].length > 0 && i < statGroups.length - 1){
			leftStats.push({type: 'EmptyLine'});
			rightStats.push({type: 'EmptyLine'});			
		}
	}

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

	const range = [...Array(rightStats.length).keys()];

	return(
		<div style={{...glob.dottedBackgroundStyle(), ...{padding: '10px 15px'}}}>
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
		<div className="my-scrollbar" style={{maxHeight: '670px', overflowY: 'auto'}}>
			{
				range.map(
					(pos) => {
						return(
							<div style={{background: glob.tableRowBackground(pos)}} key={pos}>
								<StatRow 
									leftStat={leftStats[pos]}
									rightStat={rightStats[pos]}
									kind={rightPart['Kind']}
									pos={pos}								
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
	const curPart = useContext(BuilderPartsContext).parts[preview.slot];

	let leftPart, rightPart;
	if(previewPart === null) {
		let nullPart = toNullStats(curPart);
		[leftPart, rightPart] = [nullPart, curPart];
	}
	else {
		[leftPart, rightPart] = [curPart, previewPart];
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