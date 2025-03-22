import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import aartisan from 'aartisan/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    aartisan({
      optimizationLevel: 'standard',
      accessibilityFeatures: true,
      culturalContexts: ['global']
    })
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});