/* eslint-disable antfu/no-top-level-await */
// Use Node's built-in runner; this project does not depend on Vitest.

import { after, describe } from 'node:test'
import { createSite } from '../helpers/site.ts'
import { registerImageZoom } from './imageZoom.ts'
import { registerNavigation } from './navigation.ts'
import { registerPlatform } from './platform.ts'
import { registerRoutes } from './routes.ts'
import { registerSearch } from './search.ts'
import { registerTitles } from './titles.ts'
import { registerToc } from './toc.ts'

const WORKERS = 2

// 2 个 worker（独立浏览器实例）、一个静态服务器，各 suite 并发注册与运行测试
const suites = {
  routes: registerRoutes,
  navigation: registerNavigation,
  toc: registerToc,
  titles: registerTitles,
  platform: registerPlatform,
  imageZoom: registerImageZoom,
  search: registerSearch,
}
const site = await createSite(WORKERS)

describe('e2e', { concurrency: WORKERS }, () => {
  for (const register of Object.values(suites)) register(site)
})

after(() => site.close())
