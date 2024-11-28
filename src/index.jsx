import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-tooltip/dist/react-tooltip.css'

import {BuilderPartsProvider} from "./Contexts/BuilderPartsContext.jsx";

import './reset.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
			<BuilderPartsProvider>
			<App />
			<ToastContainer />
			</BuilderPartsProvider>
		</BrowserRouter>
	</React.StrictMode>
);
