import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O repositório se chama "Nexo", então o GitHub Pages serve o app em /Nexo/.
export default defineConfig({
  base: '/Nexo/',
  plugins: [react()],
})
