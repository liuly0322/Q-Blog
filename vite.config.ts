import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import process from 'node:process'
import Vue from '@vitejs/plugin-vue'
import { Features } from 'lightningcss'
import mdLinkAttrPlugin from 'markdown-it-link-attributes'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { type ConfigEnv, defineConfig, type UserConfig, type UserConfigFnObject } from 'vite'

import Pages from 'vite-plugin-pages'
import { VitePWA } from 'vite-plugin-pwa'
import BuildPosts from './build/buildPosts'
import { getCurrentSeason, getCurrentYear } from './src/utils/date'

const markdownWrapperClasses = 'md-blog m-auto text-left'

type ClientOnly = <T>(createPlugin: () => T) => T | false

function withClientOnly(config: (env: ConfigEnv, ClientOnly: ClientOnly) => UserConfig): UserConfigFnObject {
  return env => config(env, createPlugin => env.isSsrBuild ? false : createPlugin())
}

export default defineConfig(withClientOnly(({ command, isSsrBuild }, ClientOnly) => ({
  define: {
    __BUILD_YEAR__: String(getCurrentYear()),
    __BUILD_SEASON__: JSON.stringify(getCurrentSeason()),
  },
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    {
      name: 'serve-pagefind',
      configureServer(server) {
        const directory = resolve('dist/pagefind')
        const types: Record<string, string> = { '.js': 'application/javascript', '.css': 'text/css' }
        // Serve generated bundles unchanged, outside Vite's import analysis.
        // Reuse the latest production index; run pnpm build to refresh it.
        server.middlewares.use('/pagefind/', async (request, response) => {
          try {
            const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
            const file = resolve(directory, `.${pathname}`)
            if (!file.startsWith(`${directory}${sep}`))
              throw new Error('Invalid Pagefind path')
            const content = await readFile(file)
            response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
            response.setHeader('Cache-Control', 'no-cache')
            response.end(content)
          }
          catch {
            response.writeHead(404).end('Pagefind index unavailable; run pnpm build.')
          }
        })
      },
    },
    Vue({
      include: [/\.vue$/, /\.md$/],
      features: {
        optionsAPI: false,
        prodHydrationMismatchDetails: !!process.env.HYDRATION_DETAILS && !isSsrBuild,
      },
    }),
    Markdown({
      wrapperClasses: markdownWrapperClasses,
      markdownItSetup(md) {
        md.use(mdLinkAttrPlugin, {
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
      },
    }),
    ClientOnly(() => BuildPosts({ incremental: command === 'serve' })),
    Pages({
      extensions: ['vue', 'md'],
    }),
    UnoCSS(),
    Icons({
      autoInstall: true,
    }),
    Components({
      dts: resolve(__dirname, './src/types/components.d.ts'),
      resolvers: [
        IconsResolver(),
      ],
    }),
    AutoImport({
      dts: './src/types/auto-imports.d.ts',
      imports: ['vue', 'vue-router'],
      dirs: [
        './src/composables',
      ],
    }),
    ClientOnly(() => VitePWA({
      injectRegister: 'inline',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css}'],
        globIgnores: ['pagefind/**'],
        // https://github.com/vite-pwa/vite-plugin-pwa/issues/120
        navigateFallback: null,
      },
      includeManifestIcons: false,
      manifest: {
        name: 'llyのblog',
        short_name: 'llyのblog',
        description: '我的个人博客，写点想写的',
        lang: 'zh-CN',
        theme_color: '#f6f7f8',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    })),
    process.env.ROLLUP_ENABLE_VISUALIZER && ClientOnly(() => visualizer()),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      exclude: Features.LightDark,
    },
  },
  build: {
    minify: 'terser',
    terserOptions: { compress: { passes: 2 } },
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 4096,
      },
    },
  },
})))
