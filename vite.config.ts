import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3006, // Définit le port à 6000
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
