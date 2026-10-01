import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { expectAnchor, openHydratedPage, posts } from '../helpers/site.ts'

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
