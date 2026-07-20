import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/Dashboard/' porque o app é servido em username.github.io/Dashboard/
// (repo de projeto no GitHub Pages). Se mudar o nome do repo, ajuste aqui.
export default defineConfig({
  base: '/Dashboard/',
  plugins: [react()],
})
