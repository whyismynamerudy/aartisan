import React from 'react';
import ReactDOM from 'react-dom/client';
import { AartisanProvider } from 'aartisan/react';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AartisanProvider 
      config={{
        appName: 'Aartisan Minimal App',
        appPurpose: 'demonstration',
        accessibilityLevel: 'AAA'
      }}
    >
      <App />
    </AartisanProvider>
  </React.StrictMode>
);