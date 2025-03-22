import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import aartisan from 'aartisan-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    aartisan({
      optimizationLevel: 'standard',
      accessibilityFeatures: true,
      culturalContexts: ['global'],
      verbose: false
    })
  ]
});