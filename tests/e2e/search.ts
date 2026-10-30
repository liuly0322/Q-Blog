import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { expectAnchor, expectArticleSnippet, openHydratedPage } from '../helpers/site.ts'

async function searchAsset(extension: string) {
  const files = await fs.readdir('dist/assets')
  const file = files.find(file => file.startsWith('pagefind-') && file.endsWith(`.${extension}`))
  assert(file, `Missing Pagefind ${extension} asset`)
  return `/assets/${file}`
}

export function registerSearch(harness: SiteHarness) {
  harness.test('Chinese compounds match indexed content and preserve heading links', async (site) => {
    const { page, origin } = site
    await openHydratedPage(site, '/')
    await page.waitForFunction(() => !(document.querySelector('#site-search') as HTMLButtonElement).disabled)
    await page.getByRole('button', { name: '搜索文章' }).click()
    const modal = page.getByRole('dialog', { includeHidden: true })
    await modal.getByRole('searchbox').fill('水合')
    const path = '/posts/shrink-load-time'
    const article = modal.locator(`a[href="${path}.html"]`).first()
    await article.waitFor({ state: 'visible' })
    const heading = modal.locator(`a[href="${path}.html#${encodeURIComponent('水合')}"]`)
    await heading.waitFor({ state: 'visible' })
    const hash = new URL((await heading.getAttribute('href'))!, origin).hash
    assert.equal(decodeURIComponent(hash), '#水合')
    await heading.click()
    await page.waitForURL(`${origin}${path}${hash}`)
    await expectAnchor(page, await page.evaluate(hash => `#${CSS.escape(hash.slice(1))}`, hash))
    assert.equal(await page.locator('[data-post-body]').evaluate(body => body.textContent!.includes('\u200B')), false)
  })

  harness.test('search stays disabled until UI loads, navigates across routes, and dismisses on current URL', async (site) => {
    const { page, origin } = site
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
      const button = page.getByRole('button', { name: '搜索文章' })
      assert.equal(await button.isDisabled(), true)
      release()
      await page.waitForFunction(() => !(document.querySelector('#site-search') as HTMLButtonElement).disabled)
      assert.equal(requests.some(url => /\/pagefind\/(?:pagefind\.js|pagefind-worker\.js|wasm\.|index\/|fragment\/)/.test(url)), false)
      await button.click()
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
      assert.equal(await button.isDisabled(), false)
      await page.waitForFunction(() => document.activeElement !== document.querySelector('#site-search'))
      assert.equal(await modal.getByRole('searchbox', { includeHidden: true }).inputValue(), '')
      await modal.locator('a').first().waitFor({ state: 'detached' })
      // The search button and modal continue to work after SPA navigation.
      await button.click()
      await modal.waitFor({ state: 'visible' })
      assert.equal(await modal.getByRole('searchbox').inputValue(), '')
      await modal.getByRole('searchbox').fill('Hello New World')
      const targetLink = modal.locator('a[href="/posts/hello-world.html"]').first()
      await targetLink.waitFor({ state: 'visible' })
      await targetLink.click()
      await page.waitForURL('**/posts/hello-world')
      await expectArticleSnippet(page, '/posts/hello-world')
      await modal.waitFor({ state: 'hidden' })

      // Selecting the current URL dismisses the modal without navigation.
      await button.click()
      await modal.waitFor({ state: 'visible' })
      assert.equal(await modal.getByRole('searchbox').inputValue(), '')
      await modal.getByRole('searchbox').fill('Hello New World')
      await targetLink.click()
      await modal.waitFor({ state: 'hidden', timeout: 5000 })
      assert.equal(page.url(), `${origin}/posts/hello-world`)
      await page.waitForFunction(() => document.activeElement !== document.querySelector('#site-search'))
      // The dialog close event resets the query asynchronously after it hides.
      await page.waitForFunction(() => document.querySelector<HTMLInputElement>('dialog input[type="search"]')?.value === '', undefined, { timeout: 5000 })
      assert.equal(await modal.getByRole('searchbox', { includeHidden: true }).inputValue(), '')
    }
    finally {
      release()
    }
  })

  harness.test('search jumps to different heading hashes within the current article', async (site) => {
    const { page, origin } = site
    const path = '/posts/sakurada-reset-map'
    await openHydratedPage(site, path, '[data-post-body]')
    await page.waitForFunction(() => !(document.querySelector('#site-search') as HTMLButtonElement).disabled)
    await page.evaluate(() => document.documentElement.dataset.searchTest = 'same-document')
    const button = page.getByRole('button', { name: '搜索文章' })
    const modal = page.getByRole('dialog', { includeHidden: true })
    const hashes: string[] = []
    for (const [query, heading] of [['GeoJSON', '中间层：GeoJSON'], ['初版渲染图', '后端：初版渲染图']]) {
      await button.click()
      await modal.getByRole('searchbox').fill(query)
      const id = await page.locator('[data-post-body]').locator('h2,h3,h4').filter({ hasText: heading }).getAttribute('id')
      assert(id, `Missing article heading: ${heading}`)
      const result = modal.locator(`a[href="${path}.html#${id}"]`)
      await result.waitFor({ state: 'visible' })
      const hash = new URL((await result.getAttribute('href'))!, origin).hash
      assert(!hashes.includes(hash), 'The second search must select a different heading')
      hashes.push(hash)
      await result.click()
      await page.waitForURL(`${origin}${path}${hash}`)
      await modal.waitFor({ state: 'hidden' })
      await expectAnchor(page, await page.evaluate(hash => `#${CSS.escape(hash.slice(1))}`, hash))
      await page.waitForFunction(() => document.activeElement !== document.querySelector('#site-search'))
      assert.equal(await modal.getByRole('searchbox', { includeHidden: true }).inputValue(), '')
      assert.equal(await page.evaluate(() => document.documentElement.dataset.searchTest), 'same-document')
    }
    await page.goBack()
    await page.waitForURL(`${origin}${path}${hashes[0]}`)
    await expectAnchor(page, await page.evaluate(hash => `#${CSS.escape(hash.slice(1))}`, hashes[0]))
    await page.goForward()
    await page.waitForURL(`${origin}${path}${hashes[1]}`)
    await expectAnchor(page, await page.evaluate(hash => `#${CSS.escape(hash.slice(1))}`, hashes[1]))
  })

  harness.test('Chinese modal search closes, restores focus and reopens with the keyboard', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/')
    await page.waitForFunction(() => !(document.querySelector('#site-search') as HTMLButtonElement).disabled)
    const button = page.getByRole('button', { name: '搜索文章' })
    const modal = page.getByRole('dialog', { includeHidden: true })
    // Tabbing to the trigger must not open the dialog.
    await page.locator('#sidebar a[href="/tags"]').focus()
    await page.keyboard.press('Tab')
    assert.equal(await button.evaluate(element => document.activeElement === element), true)
    assert.equal(await modal.isVisible(), false)
    await button.press('Enter')
    await modal.waitFor({ state: 'visible' })
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
    // Native dialog focus restoration must not reopen the modal.
    await page.waitForFunction(() => document.activeElement === document.querySelector('#site-search'), undefined, { timeout: 5000 })
    // Pagefind resets the query in the asynchronous close event, after focus returns.
    await page.waitForFunction(() => document.querySelector<HTMLInputElement>('dialog input[type="search"]')?.value === '', undefined, { timeout: 5000 })
    await button.press('Space')
    await modal.waitFor({ state: 'visible' })
    assert.equal(await modal.getByRole('searchbox').inputValue(), '')
    await modal.getByRole('searchbox').fill('Hello New World')
    await modal.locator('a[href="/posts/hello-world.html"]').first().waitFor({ state: 'visible' })
    await page.mouse.click(2, 2)
    await modal.waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement === document.querySelector('#site-search'), undefined, { timeout: 5000 })
    await page.waitForFunction(() => document.querySelector<HTMLInputElement>('dialog input[type="search"]')?.value === '', undefined, { timeout: 5000 })
    // Navigating elsewhere after dismissing search also releases the trigger.
    await page.locator('header a[href="/about"]').evaluate((link: HTMLAnchorElement) => link.click())
    await page.waitForURL('**/about')
    assert.equal(await button.evaluate(element => document.activeElement === element), false)
  })

  harness.test('search remains a disabled native button without JavaScript', async ({ page, origin }) => {
    await page.goto(origin)
    assert.equal(await page.getByRole('button', { name: '搜索文章' }).isDisabled(), true)
    assert.equal(await page.locator('pagefind-modal').count(), 0)
  }, { javaScriptEnabled: false })
}
