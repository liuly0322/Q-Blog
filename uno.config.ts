import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3({ dark: 'class', preflight: 'on-demand' })],
  theme: {
    colors: {
      accent: 'var(--accent)',
      muted: 'var(--muted)',
      surface: 'var(--surface)',
      inset: 'var(--inset-bg)',
      line: 'var(--border)',
    },
  },
  content: {
    pipeline: { include: [/\/src\/.*\.(?:vue|md)$/] },
  },
  // Ignore utility-like tokens from SVG paths and CSS/JS in scanned sources.
  // Use explicit utilities such as m-16, tab-4 and transition-colors instead.
  blocklist: ['m16', 'tab', 'container', 'backdrop-filter', 'transition', 'ease'],
  shortcuts: {
    // Shared sticky side column geometry.
    'aside': 'w-[256px] flex-shrink-0 sticky top-[var(--content-top)] overflow-auto max-h-[calc(100vh_-_var(--content-top))]',
    'blog-tag': `
      inline-flex items-center whitespace-nowrap
      h-7 px-2 rounded-full
      border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]
      bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]
      text-sm leading-none text-accent
      hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]
    `,
  },
  rules: [
    ['card', {
      'border-radius': '0.5rem',
      'box-shadow': '0 2px 6px rgb(0 0 0 / 4%)',
      'border-width': '0.8px',
      'border-color': 'var(--border)',
      'background-color': 'var(--surface)',
    }, { layer: 'components' }],
    ['show-more', {
      'line-height': '1em',
      'padding': '6px 15px',
      'border-radius': '15px',
      'color': 'var(--accent)',
      'background': 'color-mix(in srgb, var(--accent) 10%, transparent)',
      'text-decoration': 'none',
    }, { layer: 'components' }],
  ],
})
