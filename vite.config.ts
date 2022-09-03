import { resolve } from 'path'
import { defineConfig } from 'vite'
import Tov from './presets/tov'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [Tov()],
})
