import Typography from 'windicss/plugin/typography'
import animationPlugin from '@windicss/plugin-animations'
import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'
import lineClampPlugin from 'windicss/plugin/line-clamp'

export default defineConfig({
  darkMode: 'class',
  attributify: true,
  plugins: [
    Typography(),
    animationPlugin(),
    lineClampPlugin,
    plugin(({ addComponents }) => {
      const components = {
        '.card': {
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderWidth: '0.8px',
          borderColor: 'rgba(255, 255, 255, 0.09)',
        },
        '.blue-link': {
          color: '#258fb8',
        },
        '.show-more': {
          lineHeight: '1em',
          padding: '6px 15px',
          borderRadius: '15px',
          color: '#fff',
          background: '#258fb8',
          textShadow: '0 1px #1e7293',
          textDecoration: 'none',
        },
      }
      addComponents(components)
    }),
  ],
})
