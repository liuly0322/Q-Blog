import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3({ dark: 'class', preflight: 'on-demand' })],
  content: {
    pipeline: { include: [/\/src\/.*\.(?:vue|md)$/] },
  },
  // Ignore utility-like tokens from SVG paths and CSS/JS in scanned sources.
  // Use explicit utilities such as m-16, tab-4 and transition-colors instead.
  blocklist: ['m16', 'tab', 'container', 'backdrop-filter', 'transition', 'ease'],
  rules: [
    ['card', {
      'border-radius': '0.5rem',
      'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'border-width': '0.8px',
      'border-color': 'rgba(255, 255, 255, 0.09)',
      'background-color': 'var(--card-bg)',
    }, { layer: 'components' }],
    ['blue-link', { color: '#258fb8' }, { layer: 'components' }],
    ['show-more', {
      'line-height': '1em',
      'padding': '6px 15px',
      'border-radius': '15px',
      'color': '#fff',
      'background': '#258fb8',
      'text-shadow': '0 1px #1e7293',
      'text-decoration': 'none',
    }, { layer: 'components' }],
  ],
})
