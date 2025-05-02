import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/search_images': 'http://127.0.0.1:5000',
      '/register': 'http://127.0.0.1:5000',
      '/login': 'http://127.0.0.1:5000',
      '/users': 'http://127.0.0.1:5000',
      '/history': 'http://127.0.0.1:5000'
    }
  },
})
