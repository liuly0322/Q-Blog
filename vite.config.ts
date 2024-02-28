import { resolve } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import Inspect from 'vite-plugin-inspect'
import Windicss from 'vite-plugin-windicss'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

import { DirResolverHelper, dirResolver } from 'vite-auto-import-resolvers'
import {
  NaiveUiResolver,
  VueUseComponentsResolver,
} from 'unplugin-vue-components/resolvers'
import Modules from 'vite-plugin-use-modules'
import PkgConfig from 'vite-plugin-package-config'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import Markdown from 'vite-plugin-md'
import Prism from 'markdown-it-prism'
import anchor from 'markdown-it-anchor'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import BuildPosts from './build/buildPosts'

const markdownWrapperClasses = 'md-blog m-auto text-left'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    Modules(),
    // 将包信息文件作为 vite 的配置文件之一，为 vite-plugin-optimize-persist 所用
    PkgConfig(),
    // 依赖预构建分析，提高大型项目性能
    OptimizationPersist(),
    // vue 官方插件，用来解析 sfc
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    // markdown 编译插件
    Markdown({
      wrapperClasses: markdownWrapperClasses,
      markdownItSetup(md) {
        md.use(Prism)
        md.use(anchor)
        md.use(texmath, {
          engine: katex,
          delimiters: 'dollars',
          katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
        })
      },
    }),
    // 自动构建文件
    BuildPosts(),
    // 文件路由
    Pages({
      extensions: ['vue', 'md'],
    }),
    // 布局系统
    Layouts(),
    // 调试工具
    Inspect(),
    // windicss 插件
    Windicss({
      safelist: markdownWrapperClasses,
    }),
    // https://icones.netlify.app/
    Icons({
      autoInstall: true,
    }),
    // 组件自动按需引入
    Components({
      extensions: ['vue', 'md'],
      include: [/\.md$/, /\.vue$/],
      dts: resolve(__dirname, './types/components.d.ts'),
      resolvers: [
        IconsResolver(),
        NaiveUiResolver(),
        VueUseComponentsResolver(),
      ],
    }),
    // 目录下 api 按需自动引入辅助插件
    DirResolverHelper(),
    // api 自动按需引入
    AutoImport({
      dts: './types/auto-imports.d.ts',
      imports: ['vue', 'vue-router', '@vueuse/core'],
      resolvers: [dirResolver()],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,ico,svg}', 'index.html'],
        // https://github.com/vite-pwa/vite-plugin-pwa/issues/120
        navigateFallback: null,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'llyのblog',
        short_name: 'llyのblog',
        description: '我的个人博客，写点想写的',
        lang: 'zh-CN',
        theme_color: '#ffffff',
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
    })],
})
