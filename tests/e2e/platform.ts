import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { openHydratedPage } from '../helpers/site.ts'

export function registerPlatform(harness: SiteHarness) {
  harness.test('mobile layout follows the system theme and opens a usable sidebar', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world')
    assert(await page.locator('html').evaluate(element => element.classList.contains('dark')))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.getByRole('button', { name: 'menu' }).click()
    const sidebar = page.locator('#sidebar')
    await sidebar.waitFor({ state: 'visible' })
    await page.waitForFunction(() => {
      const bounds = document.querySelector('#sidebar')!.getBoundingClientRect()
      return bounds.width > 0 && bounds.left >= 0 && bounds.right <= innerWidth
    })
    await sidebar.locator('a[href="/archive"]').click()
    await page.waitForURL(`${site.origin}/archive`)
    await page.locator('.archive-item').first().waitFor({ state: 'visible' })
  }, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' })

  harness.test('service worker reload keeps the article hydrated', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world')
    // 首次加载还没有 controller，等的是注册已 active（等价原来的 serviceWorker.ready，但不能无界等待）
    await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), undefined, { timeout: 15_000 })
    await page.reload()
    await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated')
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  }, { serviceWorkers: 'allow' })
}
