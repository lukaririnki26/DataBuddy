import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT || '3000'),
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_BACKEND_URL || 'http://127.0.0.1:3001',
          ws: true,
        },
      },
    },
  }
})
