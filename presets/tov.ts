import { resolve } from 'path'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import Inspect from 'vite-plugin-inspect'
import Windicss from 'vite-plugin-windicss'
import ViteRestart from 'vite-plugin-restart'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

import { DirResolverHelper } from 'vite-auto-import-resolvers'
import {
  AntDesignVueResolver,
  ArcoResolver,
  ElementPlusResolver,
  NaiveUiResolver,
  VueUseComponentsResolver,
} from 'unplugin-vue-components/resolvers'
import Modules from 'vite-plugin-use-modules'
import PkgConfig from 'vite-plugin-package-config'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import BuildPosts from '../build/buildPosts'
import { AutoImportResolvers } from './shared/resolvers'
import Markdown, { markdownWrapperClasses } from './plugins/markdown'
import { env } from './shared/env'

export default () => {
  return [
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
    Markdown(),
    // 自动构建文件
    BuildPosts(),
    // 文件路由
    Pages({
      extensions: ['vue', 'md'],
    }),
    // 布局系统
    Layouts(),
    // 调试工具
    Inspect({
      enabled: env.VITE_APP_INSPECT,
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
      extensions: ['vue', 'md'],
      include: [/\.md$/, /\.vue$/],
      dts: resolve(__dirname, './types/components.d.ts'),
      resolvers: [
        ArcoResolver(),
        IconsResolver(),
        NaiveUiResolver(),
        ElementPlusResolver(),
        AntDesignVueResolver(),
        VueUseComponentsResolver(),
      ],
    }),
    // 目录下 api 按需自动引入辅助插件
    env.VITE_APP_API_AUTO_IMPORT
      && env.VITE_APP_DIR_API_AUTO_IMPORT
      && DirResolverHelper(),
    // api 自动按需引入
    env.VITE_APP_API_AUTO_IMPORT
      && AutoImport({
        dts: './presets/types/auto-imports.d.ts',
        imports: ['vue', 'vue-router', '@vueuse/core'],
        resolvers: AutoImportResolvers,
      }),
    // 预设热重启服务
    ViteRestart({
      restart: ['.env*', 'presets/tov.[jt]s', 'presets/shared/**/*'],
    }),
  ]
}
