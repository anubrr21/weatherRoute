// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: [
      'weatherroute-frontend-9y5l.onrender.com',
      'localhost',
      '127.0.0.1'
    ] // ✅ Add your Render domain here
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true
  }
})