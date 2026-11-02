import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of a subdomain, so root-relative asset paths are fine.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
