import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev: forward /api to the Express server so cookies/CORS are not an issue
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
