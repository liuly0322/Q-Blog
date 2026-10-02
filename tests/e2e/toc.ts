import type { Page } from 'playwright'
import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { expectAnchor, openHydratedPage, posts } from '../helpers/site.ts'

// Finish smooth scrolling before creating or traversing another history entry.
async function waitForScrollToSettle(page: Page) {
  await page.waitForFunction((state) => {
    const position = scrollY
    state.frames = position === state.position ? state.frames + 1 : 0
    state.position = position
    return state.frames >= 6
  }, { position: null as number | null, frames: 0 }, { timeout: 5000 })
}

async function expectSettledAnchor(page: Page, selector: string) {
  await expectAnchor(page, selector)
  await waitForScrollToSettle(page)
  await expectAnchor(page, selector)
}

export function registerToc(harness: SiteHarness) {
  harness.test('all static article TOCs match actual body DOM', async ({ page, origin }) => {
    for (const post of posts) {
      await page.goto(`${origin}/posts/${encodeURIComponent(post.url)}`)
      const actual = await page.locator('nav li[id^="toc-"]').evaluateAll(items => items.map(item => ({ id: item.id.slice(4), text: item.textContent })))
      const expected = await page.locator('[data-post-body] h2, [data-post-body] h3, [data-post-body] h4').evaluateAll(items => items.map(item => ({ id: item.id, text: item.textContent })))
      assert.deepEqual(actual, expected, post.url)
    }
  }, { javaScriptEnabled: false })

  harness.test('hydration preserves article width and TOC; observer updates state', async ({ page, origin }) => {
    let release!: () => void
    const ready = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/assets/*.js', async (route) => {
      await ready
      await route.continue()
    })
    try {
      await page.goto(`${origin}/posts/hello-world`, { waitUntil: 'commit' })
      await page.locator('#toc-feature').waitFor({ state: 'visible' })
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#toc-feature')!.closest('nav')!).position === 'sticky')
      const before = await page.locator('article').boundingBox()
      const text = await page.locator('nav li[id^="toc-"]').allTextContents()
      assert.equal(await page.evaluate(() => !!document.querySelector('#app')?.__vue_app__), false)
      release()
      await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__)
      await page.waitForFunction(() => !!document.querySelector('li[id^="toc-"].text-accent'))
      const after = await page.locator('article').boundingBox()
      assert(before && after)
      assert.equal(after.width, before.width)
      assert.equal(after.x, before.x)
      assert.deepEqual(await page.locator('nav li[id^="toc-"]').allTextContents(), text)
      await page.locator('#toc-feature').click()
      await expectAnchor(page, '#feature')
    }
    finally {
      release()
    }
  })

  harness.test('article TOC hash entries survive Back and Forward within the same article', async (site) => {
    const { page, origin } = site
    const path = '/posts/hello-world'
    await openHydratedPage(site, path, '#toc-feature')
    await page.evaluate(() => document.documentElement.dataset.tocTest = 'same-document')
    for (const hash of ['#feature', '#to-be-done']) {
      await page.locator(`#toc-${hash.slice(1)}`).click()
      await page.waitForURL(`${origin}${path}${hash}`)
      await expectSettledAnchor(page, hash)
    }
    await page.goBack()
    await page.waitForURL(`${origin}${path}#feature`)
    await expectSettledAnchor(page, '#feature')
    await page.goBack()
    await page.waitForURL(`${origin}${path}`)
    await page.waitForFunction(() => scrollY === 0, undefined, { timeout: 5000 })
    await page.goForward()
    await page.waitForURL(`${origin}${path}#feature`)
    await expectSettledAnchor(page, '#feature')
    await page.goForward()
    await page.waitForURL(`${origin}${path}#to-be-done`)
    await expectSettledAnchor(page, '#to-be-done')
    assert.equal(await page.evaluate(() => document.documentElement.dataset.tocTest), 'same-document')
  })

  harness.test('article TOC Back restores the saved position after scrolling away from a heading', async (site) => {
    const { page, origin } = site
    await openHydratedPage(site, '/posts/hello-world', '#toc-feature')
    await page.locator('#toc-feature').click()
    await expectSettledAnchor(page, '#feature')
    await page.evaluate(() => scrollTo(0, scrollY + 250))
    const position = await page.evaluate(() => scrollY)
    await page.locator('#toc-to-be-done').evaluate((item: HTMLElement) => item.click())
    await page.waitForURL(`${origin}/posts/hello-world#to-be-done`)
    await expectSettledAnchor(page, '#to-be-done')
    await page.goBack()
    await page.waitForURL(`${origin}/posts/hello-world#feature`)
    await page.waitForFunction(expected => Math.abs(scrollY - expected) < 5, position, { timeout: 5000 })
    await waitForScrollToSettle(page)
    assert(Math.abs(await page.evaluate(() => scrollY) - position) < 5, 'History restoration must survive the subsequent anchor scroll')
  })

  harness.test('clicking the current TOC hash returns to its heading after manual scrolling', async (site) => {
    const { page, origin } = site
    await openHydratedPage(site, '/posts/hello-world', '#toc-feature')
    await page.locator('#toc-feature').click()
    await page.waitForURL(`${origin}/posts/hello-world#feature`)
    await expectSettledAnchor(page, '#feature')
    await page.evaluate(() => scrollTo(0, scrollY + 250))
    assert(await page.locator('#feature').evaluate(element => element.getBoundingClientRect().top < -100))
    await page.locator('#toc-feature').click()
    await expectSettledAnchor(page, '#feature')
  })

  harness.test('SPA heading-free body clears TOC and Back restores observer', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world', '#toc-feature')
    const link = page.locator('article a[href^="/posts/"]').first()
    const target = await link.getAttribute('href')
    assert(target)
    await page.route(`**${target}.htm`, route => route.fulfill({ contentType: 'text/html', body: '<p>No headings fixture</p>' }))
    await link.click()
    await page.getByText('No headings fixture', { exact: true }).waitFor()
    assert.equal(await page.locator('nav li[id^="toc-"]').count(), 0)
    await page.goBack()
    await page.locator('#toc-feature').waitFor({ state: 'visible' })
    await page.locator('#toc-feature').click()
    await expectAnchor(page, '#feature')
    await page.waitForFunction(() => document.getElementById('toc-feature')?.classList.contains('text-accent'))
    await page.locator('#sidebar a[href="/archive"]').click()
    await page.waitForURL('**/archive')
    assert.equal(await page.locator('#toc-feature').count(), 0)
    assert(await page.locator('nav li[id^="toc-archive-"]').count() > 0)
  })

  harness.test('archive year TOC jumps to headings and only appears at xl', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/archive', '.archive-year')
    const headings = await page.locator('.archive-year').evaluateAll(items => items.map(item => ({ id: item.id, text: item.textContent?.trim() })))
    const items = page.locator('nav li[id^="toc-archive-"]')
    assert.deepEqual(await items.evaluateAll(items => items.map(item => ({ id: item.id.slice(4), text: item.textContent?.trim() }))), headings)
    const target = headings[1]
    assert(target)
    await page.locator(`#toc-${target.id}`).click()
    await expectAnchor(page, `#${target.id}`)
    await page.waitForFunction(id => document.getElementById(`toc-${id}`)?.classList.contains('text-accent'), target.id)
    await page.setViewportSize({ width: 1279, height: 1000 })
    assert.equal(await items.first().isVisible(), false)
    await page.setViewportSize({ width: 1280, height: 1000 })
    assert.equal(await items.first().isVisible(), true)
  })

  harness.test('archive TOC Back preserves manual scrolling within a hash entry', async (site) => {
    const { page, origin } = site
    await openHydratedPage(site, '/archive', '.archive-year')
    const ids = await page.locator('.archive-year').evaluateAll(items => items.map(item => item.id))
    assert(ids.length >= 3)
    await page.locator(`#toc-${ids[1]}`).click()
    await expectSettledAnchor(page, `#${ids[1]}`)
    await page.evaluate(() => scrollTo(0, scrollY + 250))
    const position = await page.evaluate(() => scrollY)
    await page.locator(`#toc-${ids[2]}`).evaluate((item: HTMLElement) => item.click())
    await page.waitForURL(`${origin}/archive#${ids[2]}`)
    await expectSettledAnchor(page, `#${ids[2]}`)
    await page.goBack()
    await page.waitForURL(`${origin}/archive#${ids[1]}`)
    await page.waitForFunction(expected => Math.abs(scrollY - expected) < 5, position, { timeout: 5000 })
    await waitForScrollToSettle(page)
    assert(Math.abs(await page.evaluate(() => scrollY) - position) < 5)
  })

  harness.test('SPA article with reused heading id observes the replacement DOM', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world', '#toc-feature')
    await page.locator('#toc-feature').click()
    await expectAnchor(page, '#feature')
    await page.waitForFunction(() => document.getElementById('toc-feature')?.classList.contains('text-accent'))

    const link = page.locator('article a[href^="/posts/"]').first()
    const target = await link.getAttribute('href')
    assert(target)
    await page.route(`**${target}.htm`, route => route.fulfill({
      contentType: 'text/html',
      body: '<div style="height: 1500px">Replacement article</div><h2 id="feature">Replacement heading</h2><div style="height: 1000px"></div>',
    }))
    await link.click()
    await page.getByRole('heading', { name: 'Replacement heading', exact: true }).waitFor({ state: 'attached' })
    await page.waitForFunction(() => {
      const item = document.getElementById('toc-feature')
      return item?.textContent?.trim() === 'Replacement heading' && !item.classList.contains('text-accent')
    })
    await page.locator('#toc-feature').click()
    await expectAnchor(page, '#feature')
    await page.waitForFunction(() => document.getElementById('toc-feature')?.classList.contains('text-accent'))
  })

  harness.test('article re-entered from archive from the same initial post keeps its TOC', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world', '#toc-feature')
    const expected = await page.locator('nav li[id^="toc-"]').allTextContents()
    assert(expected.length > 0)
    // SPA 返回归档再进同一篇：新建 [post] 组件，但 initialPost 仍指向这篇文章
    await page.locator('#sidebar a[href="/archive"]').click()
    await page.waitForURL('**/archive')
    await page.locator('.archive-item[href="/posts/hello-world"]').click()
    await page.waitForURL('**/posts/hello-world')
    await page.locator('#toc-feature').waitFor({ state: 'visible' })
    assert.deepEqual(await page.locator('nav li[id^="toc-"]').allTextContents(), expected)
    await page.locator('#toc-feature').click()
    await expectAnchor(page, '#feature')
  })
}
