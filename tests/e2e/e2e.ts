/* eslint-disable antfu/no-top-level-await */
// Use Node's built-in runner; this project does not depend on Vitest.

import { after } from 'node:test'
import { createSite } from '../helpers/site.ts'
import { registerImageZoom } from './imageZoom.ts'
import { registerNavigation } from './navigation.ts'
import { registerPlatform } from './platform.ts'
import { registerRoutes } from './routes.ts'
import { registerTitles } from './titles.ts'

// 一个浏览器、一个静态服务器，各 suite 顺序注册测试
const suites = {
  routes: registerRoutes,
  navigation: registerNavigation,
  titles: registerTitles,
  platform: registerPlatform,
  imageZoom: registerImageZoom,
}
const site = await createSite()
for (const register of Object.values(suites)) register(site)

after(() => site.close())
