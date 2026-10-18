import { Tooltip } from 'react-tooltip'

import * as glob from '../Misc/Globals.js';

const Paragraphs = ({text}) => {
	const split = text.split('\n');
	return (
		split.map(
			(str, i) => 
				<>
					<p key={2*i}>{str}</p>
					{i === split.length - 1 ? <></> : <p key={2*i + 1}>&nbsp;</p>}
				</>
		)
	);
}

let anchorId = 0;
function toAnchorName(str) {
	if(anchorId === 1000)
		anchorId = 0;
	// Strip every non-alphanumeric character so the result is a valid CSS class name
	// (spaces or slashes in the name would otherwise break the anchorSelect selector).
	return str.replace(/[^a-zA-Z0-9]/g, '') + (anchorId++)
}

const InfoBox = ({name, tooltip, place = 'left'}) => {
	const anchorName = toAnchorName(name);
	return(
		<>
		<div className={anchorName} style={{margin: '2px 1px 0px 2px'}}>
			<img src={glob.infoIcon} alt={'info icon'} width='100%'/>
		</div>
		<Tooltip 
			style={{maxWidth: '20%', textAlign: 'justify', zIndex: 6}}
			// ^ zIndex must be larger than the max zIndex of AssemblyImage 
			anchorSelect={'.' + anchorName}
			place={place}
		>
			<Paragraphs text={tooltip} />
		</Tooltip>
		</>
	)
}

export default InfoBox;