import { useState } from 'react';

import ModalWrapper from './ModalWrapper.jsx'

const AboutModal = ({closeModal}) => {
	return(
		<div style={{textAlign: 'justify'}}>
		<p>
			AC6 Advanced Garage is a tool to create, analyze and optimize builds for the game 
			Armored Core VI. It aims at replicating the look and feel of the in-game builder 
			while also providing other features, including useful additional stats that are not 
			shown in the game. An info icon next to these stats displays a tooltip that explains
			their meaning.
		</p>
		<p>&nbsp;</p>
			For more information about how stats are computed, the source code is on&nbsp;
			<a href="https://github.com/matteosal/ac6-advanced-garage" target="_blank"
				rel="noreferrer">
				GitHub
			</a>. Feel free reach out to report issues or if willing to contribute.
		<p>&nbsp;</p>
		<p>
			This is purely a passion project that I developed for fun and I intend to distribute
			freely, I will never make any money from it.
		</p>
		<p>&nbsp;</p>
		<ul style={{paddingLeft: '20px'}}>
			<li>
				Game-related images taken from the&nbsp;
					<a href="https://armoredcore.fandom.com/" target="_blank"
						rel="noreferrer">
						game wiki
					</a> with added color balancing and from in-game screenshots.
			</li>
			<li>
				Mechanic icons created by&nbsp;
				<a href="https://www.flaticon.com/free-icons/mechanic" target="_blank"
					rel="noreferrer">
				 Good Ware - Flaticon
				 </a>
			</li>
			<li>
				Sorting order icons created by&nbsp;
				<a href="https://www.flaticon.com/free-icons/sort-ascending" target="_blank"
					rel="noreferrer">
					Icon Hubs - Flaticon
				</a>			
			</li>
			<li>
				Information icon from &nbsp;
				<a href="https://icons8.com/" target="_blank" rel="noreferrer">
					icons8
				</a>			
			</li>
		</ul>
		<button 
			style={{display: 'block', width: 'fit-content', margin: '10px auto'}}
			onClick={closeModal}
		>
			BACK (ESC)
		</button>
		</div>
	)
}

const backgroundTextStyle = {width: 'fit-content',
	margin: 'auto',
	fontSize: '80px',
	textAlign: 'center',
	color: '#eee',
	fontFamily: 'Operation-Napalm, serif',
	fontWeight: 1000,
	textShadow: '2px 2px 0px #666, 5px 7px 8px black'
}

const Title = () => {
	const [modal, setModal] = useState(false);
	const closeModal = () => setModal(false);

	return(
		<>
		<div style={{...backgroundTextStyle, marginTop: '0px'}}>
			ARMORED CORE VI
		</div>
		<div style={
				{...backgroundTextStyle, fontSize: '45px', 
					marginBottom: '25px'}
		}>
			ADVANCED GARAGE
		</div>
		<button 
			style={{display: 'block', margin: 'auto'}}
			onClick={() => setModal(true)}
		>
			ABOUT/INFO
		</button>
		<ModalWrapper isOpen={modal} closeModal={closeModal}>
			{
				modal ? 
				<AboutModal closeModal={closeModal} /> :
				<></>
			}
		</ModalWrapper>
		</>
	)
}

export default Title;