import React from 'react';
import ReactDOM from 'react-dom/client';
import { AartisanProvider } from 'aartisan/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import './index.css';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AartisanProvider 
      config={{
        appName: 'Aartisan App',
        appPurpose: 'web-application',
        accessibilityLevel: 'AA'
      }}
    >
      <RouterProvider router={router} />
    </AartisanProvider>
  </React.StrictMode>
);