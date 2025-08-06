// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ Use '/' for root deployment or '/your-app-name/' for subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
