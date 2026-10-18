import { useState } from 'react';

import * as glob from '../Misc/Globals.js';
import {toAssembly} from '../Misc/Optimizer.js';
import {buildLinkUrl} from '../Misc/BuildImportExport.js';

/*****************************************************************************/

const textKeys = ['head', 'core', 'arms', 'legs', 'booster', 'generator'];

const columns = [
	{key: 'head', label: 'HEAD'},
	{key: 'core', label: 'CORE'},
	{key: 'arms', label: 'ARMS'},
	{key: 'legs', label: 'LEGS'},
	{key: 'booster', label: 'BOOSTER'},
	{key: 'generator', label: 'GENERATOR'},
	{key: 'effAP', label: 'EFF. AP'},
	{key: 'ap', label: 'AP'},
	{key: 'armor', label: 'ARMOR'},
	{key: 'stability', label: 'STABILITY'},
	{key: 'totalWeight', label: 'TOTAL WT'},
	{key: 'loadMargin', label: 'LOAD MARGIN'},
	{key: 'armsMargin', label: 'ARMS MARGIN'},
	{key: 'recoil', label: 'RECOIL'},
	{key: 'jumpDist', label: 'JUMP DIST.'},
	{key: 'qbs', label: 'QBS'},
	{key: 'qsp', label: 'QB SPEED'},
	{key: 'bsp', label: 'BOOST SPEED'},
	{key: 'abd', label: 'AB DIST. (M)'},
	{key: 'mqf', label: 'MELEE+QB CYCLES'},
	{key: 'qr', label: '1 QB REGEN (S)'},
	{key: 'fr', label: 'FULL EN (S)'},
	{key: 'rr', label: 'REDLINE→FULL (S)'},
	{key: 'score', label: 'SCORE'}
];

const longDash = '\u2012';

function sortValue(row, key) {
	if(textKeys.includes(key))
		return row[key]['Name'];
	if(key === 'jumpDist')
		return row.jumpDist ?? -Infinity;
	return row[key];
}

function formatValue(row, key) {
	switch(key) {
		case 'head': case 'core': case 'arms': case 'legs': case 'booster': case 'generator':
			return row[key]['Name'].toUpperCase();
		case 'effAP': case 'ap': case 'armor': case 'stability': case 'totalWeight':
		case 'loadMargin': case 'armsMargin': case 'recoil': case 'abd':
			return Math.round(row[key]).toLocaleString();
		case 'jumpDist':
			return row.jumpDist === null ? longDash : Math.round(row.jumpDist).toLocaleString();
		case 'qbs': return row.qbs.toFixed(1);
		case 'qsp': case 'bsp': return row[key].toFixed(0);
		case 'mqf': return row.legs['LegType'] === 'Tank' ? longDash : row.mqf.toFixed(1);
		case 'qr': case 'fr': case 'rr': return row[key].toFixed(2);
		case 'score': return row.score.toFixed(1);
		default: return row[key];
	}
}

function cellTitle(row, key) {
	switch(key) {
		case 'core': return 'Booster Eff. ' + row.core['BoosterEfficiencyAdj'] +
			' / Gen. Output ' + row.core['GeneratorOutputAdj'] +
			' / Gen. Supply ' + row.core['GeneratorSupplyAdj'];
		case 'arms': return 'Melee Spec. ' + row.arms['MeleeSpecialization'];
		case 'armor': return 'K ' + row.kineticDefense + ' / E ' + row.energyDefense +
			' / X ' + row.explosiveDefense;
		case 'totalWeight': return 'Head+core+arms+legs: ' + Math.round(row.frameWeight).toLocaleString();
		default: return undefined;
	}
}

const headerStyle = {
	padding: '6px 10px',
	background: glob.paletteColor(4),
	border: '1px solid ' + glob.paletteColor(5),
	cursor: 'pointer',
	textAlign: 'center',
	fontSize: '13px',
	whiteSpace: 'nowrap'
};

function cellStyle(rowPos, text) {
	return {
		padding: '6px 10px',
		background: glob.tableRowBackground(rowPos),
		borderBottom: '1px solid ' + glob.paletteColor(4),
		textAlign: text ? 'left' : 'right',
		whiteSpace: 'nowrap'
	};
}

const OptimizerTable = ({rows, equipment}) => {

	const [sort, setSort] = useState({key: 'score', ascend: false});

	const changeSort = key => {
		if(sort.key === key)
			setSort({key: key, ascend: !sort.ascend});
		else {
			// Regen/time/weight columns read best ascending, the rest descending
			const ascend = ['head', 'core', 'arms', 'legs', 'generator', 'totalWeight',
				'loadMargin', 'armsMargin', 'qr', 'fr', 'rr'].includes(key);
			setSort({key: key, ascend: ascend});
		}
	};

	const sortedRows = [...rows].sort((a, b) => {
		const x = sortValue(a, sort.key);
		const y = sortValue(b, sort.key);
		const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
		return sort.ascend ? c : -c;
	});

	return (
		<div className='my-scrollbar'
			style={{maxHeight: '600px', overflow: 'auto', width: 'fit-content',
				maxWidth: '100%', margin: '0px auto'}}
		>
		<table style={{borderCollapse: 'collapse'}}>
			<thead>
				<tr>
					<th style={headerStyle}>{''}</th>
					{
						columns.map(
							col => <th key={col.key} style={headerStyle}
								onClick={() => changeSort(col.key)}
							>
								<div style={{display: 'flex', alignItems: 'center',
									justifyContent: 'center', gap: '6px'}}
								>
									<span>{col.label}</span>
									{
										sort.key === col.key ?
											<img src={sort.ascend ? glob.sortIcons.ascend :
												glob.sortIcons.descend}
												alt={sort.ascend ? 'ascending' : 'descending'}
												style={{width: '14px', filter: 'invert(1)'}} /> :
											<></>
									}
								</div>
							</th>
						)
					}
				</tr>
			</thead>
			<tbody>
				{
					sortedRows.map(
						(row, rowPos) => {
							const url = buildLinkUrl(toAssembly(row, equipment));
							return (
								<tr key={rowPos}>
									<td style={{...cellStyle(rowPos, false), textAlign: 'center'}}>
										<a href={url} target="_blank" rel="noreferrer"
											title="Open in AC6 Advanced Garage">🔧</a>
									</td>
									{
										columns.map(
											col => {
												const text = textKeys.includes(col.key);
												let color = 'inherit';
												if((col.key === 'loadMargin' && row.loadMargin < 0) ||
													(col.key === 'armsMargin' && row.armsMargin < 0))
													color = 'rgb(221, 51, 51)';
												const title = cellTitle(row, col.key);
												return (
													<td key={col.key}
														style={{...cellStyle(rowPos, text), color: color}}
														title={title}
													>
														{
															col.key === 'score' ?
																<>
																	{formatValue(row, col.key)}
																	<span style={{display: 'inline-block',
																		height: '6px',
																		background: glob.paletteColor(5),
																		borderRadius: '3px',
																		marginLeft: '6px',
																		width: (row.score * 0.6) + 'px'}} />
																</> :
																formatValue(row, col.key)
														}
													</td>
												);
											}
										)
									}
								</tr>
							);
						}
					)
				}
			</tbody>
		</table>
		</div>
	);
};

export default OptimizerTable;
