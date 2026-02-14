import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: parseInt(env.VITE_SERVER_PORT || '3000'),
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8002',
          changeOrigin: true
        },
        '/dav': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8002',
          changeOrigin: true
        }
      }
    }
  }
})
