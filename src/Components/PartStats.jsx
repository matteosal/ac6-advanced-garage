import { useContext } from 'react';

import {ACPartsContext} from "../Contexts/ACPartsContext.jsx";
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
		<div style={{...glob.dottedBackgroundStyle(), ...{height: 70}}}>
			<div style={{display: 'inline-block', paddingTop: 10, paddingLeft: 20}}>
				<div>{desc.toUpperCase()}</div>
				<div style={{fontSize: '160%'}}>{part['Name']}</div>
			</div>
			<div style={{display: 'inline-block', float: 'right', paddingRight: 10}}>
				<img style={{display: 'block'}} src={manufacturerLogo} width='80px' />
			</div>
		</div>
	)
}

const fullStatGroups = {
	'Unit': [
		[
			'AttackPower', 'Impact', 'AccumulativeImpact', 'BlastRadius', 'ATKHeatBuildup',
			'ConsecutiveHits', 'DamageMitigation', 'ImpactDampening'
		],
		[
			'ChgAttackPower', 'ChgImpact', 'ChgAccumImpact', 'ChgBlastRadius', 'ChgHeatBuildup', 
			'FullChgAttackPower', 'FullChgImpact', 'FullChgAccumImpact', 'FullChgBlastRadius',
			'FullChgHeatBuildup', 'IGDamageMitigation', 'IGImpactDampening', 'IGDuration',
			'DplyHeatBuildup'
		],
		[
			'DirectHitAdjustment', 'PAInterference', 'Recoil', 'Guidance', 'IdealRange', 
			'EffectiveRange', 'HomingLockTime', 'MaxLockCount', 'RapidFire', 'ChgENLoad', 
			'ChargeTime', 'FullChgTime', 'ChgAmmoConsumption', 'FullChgAmmoConsump', 
			'MagazineRounds', 'TotalRounds', 'ReloadTime', 'DeploymentRange', 'Cooling', 
			'AmmunitionCost'
		],
		['Weight', 'ENLoad']
	],
	'Head': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		[
			'AttitudeStability', 'SystemRecovery', 'ScanDistance', 'ScanEffectDuration',
			'ScanStandbyTime'
		],
		['Weight', 'ENLoad']
	],
	'Core': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		['AttitudeStability', 'BoosterEfficiencyAdj', 'GeneratorOutputAdj', 'GeneratorSupplyAdj'],
		['Weight', 'ENLoad']
	],
	'Arms': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		['ArmsLoadLimit', 'RecoilControl', 'FirearmSpecialization', 'MeleeSpecialization'],
		['Weight', 'ENLoad']
	],
	'Legs': [
		['AP', 'AntiKineticDefense', 'AntiEnergyDefense', 'AntiExplosiveDefense'],
		[
			'AttitudeStability', 'LoadLimit', 'JumpDistance', 'JumpHeight', 'TravelSpeed',
			'HighSpeedPerf'
		],
		[
			'Thrust', 'UpwardThrust', 'UpwardENConsumption', 'QBThrust', 'QBJetDuration',
			'QBENConsumption', 'QBReloadTime',
			'QBReloadIdealWeight', 'ABThrust', 'ABENConsumption'
		],
		['Weight', 'ENLoad']
	],
	'Booster': [
		['Thrust', 'UpwardThrust', 'UpwardENConsumption'],
		[
			'QBThrust', 'QBJetDuration','QBENConsumption', 'QBReloadTime','QBReloadIdealWeight'
		],
		['ABThrust', 'ABENConsumption'],
		['MeleeAttackThrust', 'MeleeAtkENConsump'],
		['Weight', 'ENLoad']
	],
	'FCS': [
		['CloseRangeAssist', 'MediumRangeAssist', 'LongRangeAssist'],
		['MissileLockCorrection', 'MultiLockCorrection'],
		['Weight', 'ENLoad']
	],
	'Generator': [
		[
			'ENCapacity', 'ENRecharge', 'SupplyRecovery', 'PostRecoveryENSupply', 
			'EnergyFirearmSpec',
		],
		['Weight', 'ENOutput']
	],
	'Expansion': [
		[
			'AttackPower', 'Impact', 'AccumulativeImpact', 'BlastRadius', 'EffectRange',
			'Resilience', 'Duration'
		],
		['DirectHitAdjustment']
	]
};

const PartStatsBody = ({leftPart, rightPart}) => {
	const leftFiltered = filterPartKeys(leftPart)
	const rightFiltered = filterPartKeys(rightPart)

	let statGroups = fullStatGroups[rightPart['Kind']].map(
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
				leftStats.push({name: stat, value: leftFiltered[stat]});
				rightStats.push({name: stat, value: rightFiltered[stat]});
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