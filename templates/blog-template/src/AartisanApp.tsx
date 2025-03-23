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
        appName: 'blog-template',
        appPurpose: 'web-application',
        accessibilityLevel: 'AA'
      }}
    >
      <App />
    </AartisanProvider>
  );
}
