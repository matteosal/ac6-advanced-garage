import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-tooltip/dist/react-tooltip.css'

import {BuilderStateProvider} from "./Contexts/BuilderStateContext.jsx";
import {ComparerStateProvider} from "./Contexts/ComparerStateContext.jsx";
import {TablesStateProvider} from "./Contexts/TablesStateContext.jsx";
import {RicochetStateProvider} from "./Contexts/RicochetStateContext.jsx";

import './reset.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
		<BuilderStateProvider>
		<ComparerStateProvider>
		<TablesStateProvider>
		<RicochetStateProvider>
			<App />
			<ToastContainer />
		</RicochetStateProvider>
		</TablesStateProvider>
		</ComparerStateProvider>
		</BuilderStateProvider>
	</BrowserRouter>
);
