import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server:{allowedHosts: [  'https://slow-knives-yell.loca.lt']},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
