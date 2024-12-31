import { Tooltip } from 'react-tooltip'

const ClosableTooltip = ({text, anchor, place, show, setShow}) => {
	return(
			show ?
			<Tooltip 
				style={{width: '350px', padding: '4px 15px 10px 15px'}}
				anchorSelect={'.' + anchor}
				place={place}
				clickable
			>
				<div 
					style={{width: 'fit-content', margin: '0px 0px 3px auto', cursor: 'pointer',
						color: 'red'}}
					onClick={() => setShow(false)}
				>
				x
				</div>
				<div style={{width: '100%', textAlign: 'justify'}}>
					{text}
				</div>
			</Tooltip> :
			<></>
	)
}

export default ClosableTooltip;