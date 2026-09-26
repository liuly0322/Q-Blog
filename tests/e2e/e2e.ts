/* eslint-disable antfu/no-top-level-await */
import assert from 'node:assert/strict'
// Use Node's built-in runner; this project does not depend on Vitest.
// eslint-disable-next-line test/no-import-node-test
import test, { after } from 'node:test'
import { createSite, posts } from '../helpers/site.ts'
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
}
const site = await createSite()
for (const register of Object.values(suites)) register(site)

test('no page errors or console errors', (t) => {
  t.diagnostic(JSON.stringify({ articles: posts.length, suites: Object.keys(suites), errors: site.errors.length }))
  assert.deepEqual(site.errors, [])
})

after(() => site.close())
