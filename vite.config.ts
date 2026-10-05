import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import process from 'node:process'
import Vue from '@vitejs/plugin-vue'
import mdLinkAttrPlugin from 'markdown-it-link-attributes'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'

import Pages from 'vite-plugin-pages'
import { VitePWA } from 'vite-plugin-pwa'
import vsharp from 'vite-plugin-vsharp'
import BuildPosts from './build/buildPosts'
import { getCurrentSeason, getCurrentYear } from './src/utils/date'

const markdownWrapperClasses = 'md-blog m-auto text-left'

const buildStamp = { year: getCurrentYear(), season: getCurrentSeason() }

export default defineConfig(({ command, isSsrBuild }) => ({
  define: {
    __BUILD_YEAR__: String(buildStamp.year),
    __BUILD_SEASON__: JSON.stringify(buildStamp.season),
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
    // vue 官方插件，用来解析 sfc
    Vue({
      include: [/\.vue$/, /\.md$/],
      features: {
        optionsAPI: false,
        prodHydrationMismatchDetails: !!process.env.HYDRATION_DETAILS && !isSsrBuild,
      },
    }),
    // markdown 编译插件
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
    // 自动构建文件
    !isSsrBuild && BuildPosts({ incremental: command === 'serve' }),
    // 文件路由
    Pages({
      extensions: ['vue', 'md'],
    }),
    UnoCSS(),
    // https://icones.netlify.app/
    Icons({
      autoInstall: true,
    }),
    // 组件自动按需引入
    Components({
      dts: resolve(__dirname, './src/types/components.d.ts'),
      resolvers: [
        IconsResolver(),
      ],
    }),
    // api 自动按需引入
    AutoImport({
      dts: './src/types/auto-imports.d.ts',
      imports: ['vue', 'vue-router'],
      dirs: [
        './src/composables',
      ],
    }),
    // PWA
    !isSsrBuild && VitePWA({
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
    }),
    // 压缩图片
    !isSsrBuild && vsharp({
      excludePublic: [
        'public/*',
      ],
      includePublic: [
        'public/images/*.png',
        'public/images/*.jpg',
      ],
    }),
    // 打包体积分析
    !isSsrBuild && visualizer(),
  ],
  css: {
    transformer: 'lightningcss',
  },
  build: {
    minify: 'terser',
    terserOptions: { compress: { passes: 2 } },
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 10_000,
      },
    },
  },
}))
