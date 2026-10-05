import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { openHydratedPage, posts, waitForScrollToSettle } from '../helpers/site.ts'

export function registerPlatform(harness: SiteHarness) {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    harness.test(`footer stays at the bottom on short pages and follows long content at ${viewport.width}px`, async (site) => {
      const { page, origin } = site
      const tag = posts.flatMap(post => post.tags).find(tag => posts.filter(post => post.tags.includes(tag)).length === 1)
      assert(tag, 'A single-article tag is required for the short-page fixture')
      const path = `/tags/${encodeURIComponent(tag)}`
      await openHydratedPage(site, path, '.grid')
      const footer = page.locator('footer')
      async function expectFooterAtBottom() {
        const bounds = await footer.boundingBox()
        assert(bounds)
        assert(Math.abs(bounds.y + bounds.height - viewport.height) < 2, 'Footer must reach the bottom of the viewport')
      }
      await expectFooterAtBottom()

      if (await page.getByRole('button', { name: 'menu' }).isVisible())
        await page.getByRole('button', { name: 'menu' }).click()
      await page.locator('#sidebar a[href="/archive"]').click()
      await page.waitForURL(`${origin}/archive`)
      await page.locator('h2[id^="archive-"]').first().waitFor({ state: 'visible' })
      const content = await page.locator('main').boundingBox()
      const afterContent = await footer.boundingBox()
      assert(content && afterContent)
      assert(afterContent.y >= content.y + content.height - 1, 'Footer must follow the content without overlapping it')
      assert(afterContent.y >= viewport.height, 'Footer must stay below the viewport while reading long content')
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
      await expectFooterAtBottom()

      await page.goBack()
      await page.waitForURL(`${origin}${path}`)
      await page.locator('.grid').waitFor({ state: 'visible' })
      await waitForScrollToSettle(page)
      await expectFooterAtBottom()
    }, { viewport, isMobile: viewport.width < 1024, hasTouch: viewport.width < 1024 })
  }

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
    await page.locator('main a[href^="/posts/"]').first().waitFor({ state: 'visible' })
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
