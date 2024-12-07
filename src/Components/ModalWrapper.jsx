import { useRef, useEffect } from 'react';

import * as glob from '../Misc/Globals.js';

const ModalWrapper = ({isOpen, closeModal, children}) => {
	const dialogRef = useRef();

	useEffect(() => {
		if(isOpen)
			dialogRef.current?.showModal();
		else
			dialogRef.current?.close();
		}, 
		[isOpen]
	);

	return (
		<dialog 
			ref={dialogRef}
			onCancel={closeModal}
			style={{
				...glob.dottedBackgroundStyle(glob.paletteColor(2)),
				...{borderColor: glob.paletteColor(5), color: 'inherit', maxWidth: '40%'}
			}}
		>
			{children}
		</dialog>
	);
}

export default ModalWrapper;