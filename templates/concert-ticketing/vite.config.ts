import aartisan from "aartisan/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({
  mode
}) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), mode === 'live' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));