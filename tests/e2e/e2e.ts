/* eslint-disable antfu/no-top-level-await */
// Use Node's built-in runner; this project does not depend on Vitest.

import { after } from 'node:test'
import { createSite } from '../helpers/site.ts'
import { registerImageZoom } from './imageZoom.ts'
import { registerNavigation } from './navigation.ts'
import { registerPlatform } from './platform.ts'
import { registerRoutes } from './routes.ts'
import { registerSearch } from './search.ts'
import { registerTitles } from './titles.ts'
import { registerToc } from './toc.ts'

// 一个浏览器、一个静态服务器，各 suite 顺序注册测试
const suites = {
  routes: registerRoutes,
  navigation: registerNavigation,
  toc: registerToc,
  titles: registerTitles,
  platform: registerPlatform,
  imageZoom: registerImageZoom,
  search: registerSearch,
}
const site = await createSite()
for (const register of Object.values(suites)) register(site)

after(() => site.close())
