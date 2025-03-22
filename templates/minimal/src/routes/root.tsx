import { Outlet } from 'react-router-dom';
import { aiPurpose } from 'aartisan/react';
import './app.css';

export default function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <header 
        className="bg-slate-800 text-white py-4 px-6"
        {...aiPurpose('site-header')}
      >
        <h1 className="text-2xl font-semibold">Aartisan App</h1>
      </header>
      
      <main className="flex-grow p-6" {...aiPurpose('content-container')}>
        <Outlet />
      </main>
      
      <footer 
        className="bg-slate-800 text-white py-4 px-6 text-center text-sm"
        {...aiPurpose('site-footer')}
      >
        <p>Built with Aartisan - AI Agent Toolkit for React</p>
      </footer>
    </div>
  );
}