import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { openHydratedPage } from '../helpers/site.ts'

export function registerPlatform(harness: SiteHarness) {
  harness.test('mobile layout follows the system theme and opens a usable sidebar', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world')
    assert(await page.locator('html').evaluate(element => element.classList.contains('dark')))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    const sidebar = page.locator('#sidebar')
    const overlay = page.locator('#mdui-overlay')

    async function expectClosed() {
      assert.equal(await sidebar.count(), 1, 'Sidebar must remain mounted')
      assert.equal(await overlay.count(), 1, 'Overlay must remain mounted')
      await page.waitForFunction(() => {
        const sidebar = document.querySelector('#sidebar')
        const overlay = document.querySelector('#mdui-overlay')
        return sidebar && overlay
          && sidebar.getBoundingClientRect().left >= innerWidth
          && getComputedStyle(overlay).display === 'none'
      }, undefined, { timeout: 5000 })
    }

    async function openSidebar() {
      assert.equal(await sidebar.count(), 1, 'Sidebar must exist')
      assert.equal(await overlay.count(), 1, 'Overlay must exist')
      await page.getByRole('button', { name: 'menu' }).click()
      await page.waitForFunction(() => {
        const sidebar = document.querySelector('#sidebar')
        const overlay = document.querySelector('#mdui-overlay')
        if (!sidebar || !overlay)
          return false
        const bounds = sidebar.getBoundingClientRect()
        const style = getComputedStyle(overlay)
        return bounds.width > 0 && bounds.left >= 0 && bounds.right <= innerWidth
          && style.display !== 'none' && style.visibility === 'visible'
          && Number.parseFloat(style.opacity) > 0
      }, undefined, { timeout: 5000 })
    }

    await expectClosed()
    await openSidebar()
    assert.equal(await sidebar.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(30, 30, 30)')
    // Tap outside the sidebar; this also verifies the overlay receives input.
    await overlay.tap({ position: { x: 10, y: 10 } })
    await expectClosed()

    await openSidebar()
    await sidebar.locator('a[href="/archive"]').click()
    await page.waitForURL(`${site.origin}/archive`)
    await page.locator('.archive-item').first().waitFor({ state: 'visible' })
    await expectClosed()

    await openSidebar()
    await sidebar.locator('a[href="/archive"]').click()
    await expectClosed()
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
