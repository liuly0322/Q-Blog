import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { expectArticleSnippet, openHydratedPage } from '../helpers/site.ts'

async function searchAsset(extension: string) {
  const files = await fs.readdir('dist/assets')
  const file = files.find(file => file.startsWith('pagefind-') && file.endsWith(`.${extension}`))
  assert(file, `Missing Pagefind ${extension} asset`)
  return `/assets/${file}`
}

export function registerSearch(harness: SiteHarness) {
  harness.test('search stays disabled until the official UI loads, then opens a modal and navigates within the SPA', async (site) => {
    const { page } = site
    let release: () => void
    let requested: () => void
    const gate = new Promise<void>(resolve => release = resolve)
    const bundleRequested = new Promise<void>(resolve => requested = resolve)
    const requests: string[] = []
    page.on('request', request => requests.push(new URL(request.url()).pathname))
    await page.route(`**${await searchAsset('js')}`, async (route) => {
      requested()
      await gate
      await route.continue()
    })
    try {
      await openHydratedPage(site, '/')
      await bundleRequested
      const input = page.getByRole('textbox', { name: '搜索文章' })
      assert.equal(await input.isDisabled(), true)
      release()
      await page.waitForFunction(() => !(document.querySelector('#site-search') as HTMLInputElement).disabled)
      assert.equal(requests.some(url => /\/pagefind\/(?:pagefind\.js|pagefind-worker\.js|wasm\.|index\/|fragment\/)/.test(url)), false)
      await input.click()
      const modal = page.getByRole('dialog', { includeHidden: true })
      await modal.waitFor({ state: 'visible' })
      await modal.getByRole('searchbox').fill('GeoJSON')
      const result = modal.locator('a[href="/posts/sakurada-reset-map.html"]').first()
      await result.waitFor({ state: 'visible' })
      assert(await modal.locator('mark').count() > 0)
      await page.evaluate(() => document.documentElement.dataset.searchTest = 'same-document')
      // Modified clicks keep the native link, including the static HTML URL.
      const popupOpened = page.context().waitForEvent('page')
      await result.click({ modifiers: ['Control'] })
      const popup = await popupOpened
      await expectArticleSnippet(popup, '/posts/sakurada-reset-map')
      await popup.close()
      assert.equal(new URL(page.url()).pathname, '/')
      await result.click()
      await page.waitForURL('**/posts/sakurada-reset-map')
      await expectArticleSnippet(page, '/posts/sakurada-reset-map')
      assert.equal(await page.evaluate(() => document.documentElement.dataset.searchTest), 'same-document')
      await modal.waitFor({ state: 'hidden' })
      assert.equal(await input.isDisabled(), false)
      await page.waitForFunction(() => document.activeElement !== document.querySelector('#site-search'))
      assert.equal(await modal.getByRole('searchbox', { includeHidden: true }).inputValue(), '')
      await modal.locator('a').first().waitFor({ state: 'detached' })
      // The enhanced input and modal continue to work after SPA navigation.
      await input.click()
      await modal.waitFor({ state: 'visible' })
      assert.equal(await modal.getByRole('searchbox').inputValue(), '')
      await modal.getByRole('searchbox').fill('Hello New World')
      await modal.locator('a[href="/posts/hello-world.html"]').first().waitFor({ state: 'visible' })
    }
    finally {
      release()
    }
  })

  harness.test('Chinese modal search closes, restores focus and reopens with the keyboard', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/')
    await page.waitForFunction(() => !(document.querySelector('#site-search') as HTMLInputElement).disabled)
    const input = page.getByRole('textbox', { name: '搜索文章' })
    await input.focus()
    const modal = page.getByRole('dialog', { includeHidden: true })
    await modal.getByRole('searchbox').fill('博客')
    await modal.locator('mark').first().waitFor({ state: 'visible' })
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    const colours = await modal.evaluate(dialog => ({
      background: getComputedStyle(dialog).backgroundColor,
      surface: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim(),
    }))
    assert.equal(colours.surface, '#1e1e1e')
    assert.equal(colours.background, 'rgb(30, 30, 30)')
    await modal.getByRole('searchbox').press('Escape')
    await modal.waitFor({ state: 'hidden' })
    // Hiding the dialog is synchronous; its close event restores focus later.
    await page.waitForFunction(() => document.activeElement === document.querySelector('#site-search'), undefined, { timeout: 5000 })
    await input.press('Enter')
    await modal.waitFor({ state: 'visible' })
    assert.equal(await modal.getByRole('searchbox').inputValue(), '')
    await modal.getByRole('searchbox').fill('Hello New World')
    await modal.locator('a[href="/posts/hello-world.html"]').first().waitFor({ state: 'visible' })
    await page.mouse.click(2, 2)
    await modal.waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement === document.querySelector('#site-search'), undefined, { timeout: 5000 })
    assert.equal(await modal.getByRole('searchbox', { includeHidden: true }).inputValue(), '')
    // Navigating elsewhere after dismissing search also releases the trigger.
    await page.locator('header a[href="/about"]').evaluate((link: HTMLAnchorElement) => link.click())
    await page.waitForURL('**/about')
    assert.equal(await input.evaluate(element => document.activeElement === element), false)
  })

  harness.test('search remains a disabled native input without JavaScript', async ({ page, origin }) => {
    await page.goto(origin)
    assert.equal(await page.getByRole('textbox', { name: '搜索文章' }).isDisabled(), true)
    assert.equal(await page.locator('pagefind-modal').count(), 0)
  }, { javaScriptEnabled: false })
}
