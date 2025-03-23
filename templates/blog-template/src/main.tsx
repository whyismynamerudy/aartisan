import { AartisanProvider } from "aartisan/react";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './AartisanApp';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<AartisanProvider config={{
  appName: "blog-template",
  appPurpose: "web-application"
}}><React.StrictMode>
    <App />
  </React.StrictMode></AartisanProvider>);