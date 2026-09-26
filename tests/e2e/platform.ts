import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { openHydratedPage } from '../helpers/site.ts'
import type { Site } from '../helpers/site.ts'

export function registerPlatform(site: Site) {
  test('mobile layout: dark scheme, no horizontal overflow, sidebar toggle', async () => {
    const mobile = await site.newPage({
      viewport: { width: 390, height: 844 },
      colorScheme: 'dark',
      serviceWorkers: 'block',
    })
    try {
      await openHydratedPage(mobile, '/posts/hello-world')
      assert(await mobile.page.locator('html').evaluate(element => element.classList.contains('dark')))
      assert(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await mobile.page.getByRole('button', { name: 'menu' }).click()
      await mobile.page.waitForFunction(() => document.querySelector('#sidebar')?.classList.contains('sidebar-open'), undefined, {})
    }
    finally {
      await mobile.close()
    }
  })

  test('service worker reload keeps the article hydrated', { timeout: 60_000 }, async () => {
    const sw = await site.newPage()
    try {
      await openHydratedPage(sw, '/posts/hello-world')
      // 首次加载还没有 controller，等的是注册已 active（等价原来的 serviceWorker.ready，但不能无界等待）
      await sw.page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), undefined, { timeout: 15_000 })
      await sw.page.reload()
      await sw.page.locator('[data-post-body]').waitFor({ state: 'visible' })
      await sw.page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
    }
    finally {
      await sw.close()
    }
  })
}
