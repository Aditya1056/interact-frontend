import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import ToastContextProvider from './util/Providers/ToastContextProvider.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
    <ToastContextProvider>
        <App />
    </ToastContextProvider>
  // </React.StrictMode>
);
