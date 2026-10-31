import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
      }
    }
=======
  resolve: {
    preserveSymlinks: true
  },
  server: {
    port: 5173,
    host: true
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
  }
});

