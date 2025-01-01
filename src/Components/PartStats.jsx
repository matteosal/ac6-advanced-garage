import { useContext } from 'react';

import {BuilderStateContext, BuilderStateDispatchContext} from 
	"../Contexts/BuilderStateContext.jsx";
import {StatRow} from './StatRows.jsx';
import ClosableTooltip from './ClosableTooltip.jsx';
import * as glob from '../Misc/Globals.js';

function toNullStats(part) {
	return Object.fromEntries(
		Object.entries(part).map(([k, v]) => [k, null])
	)
}

const UnitIcon = ({img}) => {
	return <img src={img} alt='unit icon' width='20px' 
		style={{margin: '0px 2px', border: 'solid 1px gray'}} />
}

const modifiedSpecsTooltipText = 'Shows the effect of other currently equipped parts on ' +
	'the relevant unit specs: Melee Specialization from the arms, Energy Firearm ' + 
	'Specialization from the generator and Missile Lock Correction from the FCS.';

const PartStatsHeader = ({part}) => {

	const state = useContext(BuilderStateContext);
	const stateDispatch = useContext(BuilderStateDispatchContext);

	let desc;
	if(part['Kind'] === 'Unit' && part['ID'] !== glob.noneUnit['ID']) {
		desc = part['Description']
	}
	else
		desc = part['Kind']

	const manufacturerLogo = glob.manufacturerLogos[part['Manufacturer'] + '.png'];

	const toggleShowModifiedSpecs = () => stateDispatch(
		{target: 'showModifiedSpecs', value: !state.showModifiedSpecs}
	);
	const setShowModifiedSpecsTooltip = val => stateDispatch(
		{target: 'showModifiedSpecsTooltip', value: val}
	);

	return(
		<div style={{...glob.dottedBackgroundStyle(), ...{height: 100}}}>
			<div style={{display: 'inline-block', paddingTop: 10, paddingLeft: 20, 
				paddingBottom: 11}}>
				<div>{desc.toUpperCase()}</div>
				<div style={{fontSize: '160%'}}>{part['Name']}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right', paddingRight: 10}}>
				<img style={{display: 'block'}} alt={part['Manufacturer']} 
					src={manufacturerLogo} width='70px' />
			</div>
			<div 
				style={{display: 'flex', justifyContent: 'space-evenly', width: '100%'}}
			>
				<div>
					<label style={{fontSize: '12px'}} className='checkbox-tooltip-anchor' htmlFor='modified-stats-checkbox'>
						SHOW MODIFIED SPECS
					</label>
					<input
						type='checkbox'
						id='modified-stats-checkbox'
						className='checkbox-tooltip-anchor'
						style={{marginLeft: 10, position: 'relative', top: 2}}
					checked={state.showModifiedSpecs}
					onChange={toggleShowModifiedSpecs}
					/>
				</div>
				<ClosableTooltip
					text={modifiedSpecsTooltipText}
					place='right'
					anchor='checkbox-tooltip-anchor'
					show={state.showModifiedSpecsTooltip}
					setShow={setShowModifiedSpecsTooltip}
				/>					
				<div>
					<label style={{fontSize: '12px'}} htmlFor='normalize-dropdown'>
						NORMALIZE SPECS:
					</label>
					<select style={{marginLeft: 10, fontSize: '12px'}} id='normalize-dropdown'>
						<option value="feature1">None</option>
						<option value="feature2">Weight</option>
						<option value="feature2">EN Load</option>
					</select>
				</div>
			</div>
		</div>
	)
}

const meleeSpecializationStats = ['AttackPower', 'ComboDamage', 'DirectAttackPower',
	'ComboDirectDamage', 'ChgAttackPower'];
const missileLockCorrectionStats = ['HomingLockTime', 'Damage/sInclReload',
	'Impact/sInclReload', 'AccImpact/sInclReload'];
const energyFirearmSpecStats = ['AttackPower', 'Damage/s', 'Damage/sInclReload', 
	'DirectAttackPower', 'DirectDamage/s', 'ChgAttackPower', 'FullChgAttackPower', 
	'ChargeTime', 'FullChgTime'];

function getModifiedDmgSpec(baseValue, modifyingSpec) {
	const correction = 1 + (modifyingSpec - 100) / 200.;

	if(baseValue.constructor === Array)
		return [baseValue[0] * correction, baseValue[1]]
	else
		return baseValue * correction	
}

function getSpec(part, name, showModifiedSpecs, assembly) {
	if(part['Kind'] !== 'Unit' || !showModifiedSpecs) {
		return part[name];
	} else if(part['WeaponType'] === 'Melee' && meleeSpecializationStats.includes(name)) {
		// Melee specialization
		return getModifiedDmgSpec(part[name], (assembly.arms)['MeleeSpecialization']);
	} else if(part['WeaponType'] === 'Homing' && missileLockCorrectionStats.includes(name)) {
		// Missile lock correction
		const baseLockTime = part['HomingLockTime'];
		const correction = 2 - (assembly.fcs)['MissileLockCorrection'] / 100.;
		const newLockTime = baseLockTime * correction;
		if(name === 'HomingLockTime')
			return newLockTime;

		let oldDen = part['ReloadTime'] + baseLockTime;
		if(part['MagDumpTime'])
			oldDen += part['MagDumpTime'];

		return part[name] * oldDen / (oldDen - baseLockTime + newLockTime);
	} else if(
		part['AttackType'] === 'Energy' &&
		part['WeaponType'] !== 'Melee' &&
		energyFirearmSpecStats.includes(name)
	) {
		// Energy firearm specialization		
		if(['ChargeTime', 'FullChgTime'].includes(name)) {
			const correction = 2 - (assembly.generator)['EnergyFirearmSpec'] / 100.;
			return part[name] * correction;
		}
		return getModifiedDmgSpec(part[name], (assembly.generator)['EnergyFirearmSpec']);
	} else
		return part[name]
}

function toRowType(statName) {
	return statName === 'MagDumpTime' ? 'NumericNoComparison' : 'Numeric'
}

const PartStatsBody = ({leftPart, rightPart}) => {

	const state = useContext(BuilderStateContext);
	const assembly = state.parts;
	const showModifiedSpecs = state.showModifiedSpecs;

	let statGroups = glob.partStatGroups[rightPart['Kind']].map(
		group => group.filter(stat => rightPart[stat] !== undefined)
	);

	let leftStats = [];
	let rightStats = [];
	for(let i = 0; i < statGroups.length; i++) {
		statGroups[i].map(
			stat => {
				const leftVal = getSpec(leftPart, stat, showModifiedSpecs, assembly);
				const rightVal = getSpec(rightPart, stat, showModifiedSpecs, assembly);
				leftStats.push({name: stat, value: leftVal, type: toRowType(stat)});
				rightStats.push({name: stat, value: rightVal, type: toRowType(stat)});
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
		<div style={{...glob.dottedBackgroundStyle(), padding: '10px 15px'}}>
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
		<div className="my-scrollbar" style={{maxHeight: '640px', overflowY: 'auto'}}>
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

const PartStats = () => {

	const state = useContext(BuilderStateContext);

	const previewPart = state.preview.part;
	const curPart = state.parts[state.preview.slot];

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