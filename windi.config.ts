import Typography from 'windicss/plugin/typography'
import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'

export default defineConfig({
  darkMode: 'class',
  attributify: true,
  plugins: [
    Typography(),
    plugin(({ addComponents }) => {
      const cards = {
        '.card': {
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderWidth: '0.8px',
          borderColor: 'rgba(255, 255, 255, 0.09)',
        },
      }
      addComponents(cards)
    }),
  ],
})
