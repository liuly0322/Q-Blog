import { resolve } from 'node:path'
import Terser from '@rollup/plugin-terser'
import Vue from '@vitejs/plugin-vue'
import mdLinkAttrPlugin from 'markdown-it-link-attributes'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import {
  NaiveUiResolver,
  VueUseComponentsResolver,
} from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'

import { VitePWA } from 'vite-plugin-pwa'
import vsharp from 'vite-plugin-vsharp'
import Windicss from 'vite-plugin-windicss'
import BuildPosts from './build/buildPosts'
import PartialEvaluator from './partial-evaluate'

const markdownWrapperClasses = 'md-blog m-auto text-left'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    // vue 官方插件，用来解析 sfc
    Vue({
      include: [/\.vue$/, /\.md$/],
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
    BuildPosts(),
    // 文件路由
    Pages({
      extensions: ['vue', 'md'],
    }),
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
      dts: resolve(__dirname, './src/types/components.d.ts'),
      resolvers: [
        IconsResolver(),
        NaiveUiResolver(),
        VueUseComponentsResolver(),
      ],
    }),
    // api 自动按需引入
    AutoImport({
      dts: './src/types/auto-imports.d.ts',
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dirs: [
        './src/composables',
      ],
    }),
    // 部分求值插件
    PartialEvaluator({
      silent: true,
      components: {
        Input: {
          loading: undefined,
          showCount: false,
          maxlength: undefined,
          pair: false,
          type: '\'text\'',
        },
        Tag: {
          disabled: false,
          checkable: false,
          closable: false,
        },
        Rate: {
          allowHalf: true,
          clearable: false,
        },
      },
    }),
    // Terser
    Terser(),
    // PWA
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,ico,svg}'],
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
    }),
    // 压缩图片
    vsharp({
      excludePublic: [
        'public/*',
      ],
      includePublic: [
        'public/images/*.png',
        'public/images/*.jpg',
      ],
    }),
    // 打包体积分析
    visualizer(),
  ],
  css: {
    transformer: 'lightningcss',
  },
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 10_000,
      },
    },
  },
})
