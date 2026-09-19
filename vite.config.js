import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: './.vite_cache',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
