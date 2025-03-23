import { AartisanProvider } from "aartisan/react";
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
createRoot(document.getElementById("root")!).render(<AartisanProvider config={{
  appName: "vite_react_shadcn_ts",
  appPurpose: "web-application"
}}><App /></AartisanProvider>);