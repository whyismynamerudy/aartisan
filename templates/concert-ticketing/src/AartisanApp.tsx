import { AartisanProvider } from 'aartisan/react';
import App from './App';

/**
 * AartisanApp
 * 
 * This component wraps the main App component with the AartisanProvider
 * to provide AI-optimization features throughout the application.
 */
export default function AartisanApp() {
  return (
    <AartisanProvider 
      config={{
        appName: 'vite_react_shadcn_ts',
        appPurpose: 'web-application',
        accessibilityLevel: 'AA'
      }}
    >
      <App />
    </AartisanProvider>
  );
}
