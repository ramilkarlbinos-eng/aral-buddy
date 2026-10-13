import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/aral-buddy/', // Makes sure links work on GitHub Pages
})
