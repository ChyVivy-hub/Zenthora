import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Zenthora/',
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist'
  }
})