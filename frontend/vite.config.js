import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // REST API — proxied to Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket proctoring stream — proxied to FastAPI AI microservice
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
