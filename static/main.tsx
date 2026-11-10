import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../app/page';
import '../app/globals.css';
const basePath=new URL('.',document.baseURI).pathname.replace(/\/$/,'');
createRoot(document.getElementById('root')!).render(<React.StrictMode><App basePath={basePath}/></React.StrictMode>);
