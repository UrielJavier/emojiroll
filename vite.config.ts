import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // served from https://<user>.github.io/emojiroll/ on GitHub Pages
  base: '/emojiroll/',
  plugins: [react()],
  // bundle gifenc into the SSR build so the prerender step doesn't hit Node's
  // CJS/ESM named-export interop (gifenc ships no "exports" map)
  ssr: { noExternal: ['gifenc'] },
})
