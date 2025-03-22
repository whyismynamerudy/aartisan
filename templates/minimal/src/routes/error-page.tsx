import { useRouteError } from 'react-router-dom';
import { aiPurpose } from 'aartisan/react';

export default function ErrorPage() {
  const error = useRouteError() as any;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50" {...aiPurpose('error-page')}>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-lg mb-4">Sorry, an unexpected error has occurred.</p>
        <p className="text-slate-600 mb-6">
          {error?.statusText || error?.message || "Unknown error"}
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
          {...aiPurpose('return-home')}
        >
          Return Home
        </a>
      </div>
    </div>
  );
}