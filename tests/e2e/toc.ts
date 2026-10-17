import type { Page } from 'playwright'
import type { Site, SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { archiveWithToc, articleWithToc, expectAnchor, openHydratedPage, waitForScrollToSettle } from '../helpers/site.ts'

async function expectSettledAnchor(page: Page, selector: string) {
  await expectAnchor(page, selector)
  await waitForScrollToSettle(page)
  await expectAnchor(page, selector)
}

async function expectActive(page: Page, id: string | null) {
  await page.waitForFunction((id) => {
    const active = document.querySelectorAll('#page-toc li.text-accent')
    return id === null ? active.length === 0 : active.length === 1 && active[0].id === `toc-${id}`
  }, id, { timeout: 5000 })
}

async function mockNextPost({ page }: Site, body: string) {
  const link = page.locator('article a[href^="/posts/"]').first()
  const target = await link.getAttribute('href')
  assert(target)
  await page.route(`**${target}.htm`, route => route.fulfill({ contentType: 'text/html', body }))
  await link.click()
}

export function registerToc(harness: SiteHarness) {
  harness.test('TOC tracks section boundaries and viewport reflow', async (site) => {
    const { page } = site
    await openHydratedPage(site, articleWithToc.path, '#toc-feature')
    await mockNextPost(site, '<div style="height: 30vw"></div><h2 id="one" style="scroll-margin-top: 120px">One</h2><div style="height: 1400px"></div><h3 id="two" style="scroll-margin-top: 160px">Two</h3><div style="height: 1400px"></div>')
    await page.locator('#toc-two').waitFor({ state: 'visible' })
    const [first, second] = await page.locator('[data-post-body] h2, [data-post-body] h3').evaluateAll(headings => headings.map(heading => heading.getBoundingClientRect().top + scrollY - Number.parseFloat(getComputedStyle(heading).scrollMarginTop)))
    assert(first !== undefined && second !== undefined)
    for (const [top, id] of [[first - 5, null], [first + 5, 'one'], [first + 500, 'one'], [second - 5, 'one'], [second + 5, 'two'], [second - 5, 'one']] as const) {
      await page.evaluate(top => scrollTo(0, top), top)
      await expectActive(page, id)
    }
    // A visible upcoming heading must not displace the section being read.
    assert(await page.locator('#one').evaluate(element => element.getBoundingClientRect().bottom < 0))
    assert(await page.locator('#two').evaluate(element => element.getBoundingClientRect().top < innerHeight))
    await page.addStyleTag({ content: 'html { overflow-anchor: none }' })
    await page.evaluate(top => scrollTo(0, top), first - 5)
    await expectActive(page, null)
    const position = await page.evaluate(() => scrollY)
    await page.setViewportSize({ width: 1280, height: 1000 })
    await expectActive(page, 'one')
    assert.equal(await page.evaluate(() => scrollY), position)
  })

  harness.test('TOC corrects its active section after a delayed image loads without scrolling', async (site) => {
    const { page } = site
    let release!: () => void
    const ready = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/images/toc-delayed.svg', async (route) => {
      await ready
      await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="800"><rect width="400" height="800" fill="gray"/></svg>' })
    })
    try {
      await openHydratedPage(site, articleWithToc.path, '#toc-feature')
      await page.addStyleTag({ content: 'html { overflow-anchor: none }' })
      await mockNextPost(site, '<div style="height: 300px"></div><h2 id="one">One</h2><img src="/images/toc-delayed.svg" alt="Delayed image"><h2 id="two">Two</h2><div style="height: 1800px"></div>')
      await page.locator('#toc-two').waitFor({ state: 'visible' })
      await page.locator('#two').evaluate((element) => {
        scrollTo(0, element.getBoundingClientRect().top + scrollY - Number.parseFloat(getComputedStyle(element).scrollMarginTop) + 5)
      })
      await expectActive(page, 'two')
      const position = await page.evaluate(() => scrollY)
      release()
      await page.waitForFunction(() => document.querySelector<HTMLImageElement>('[data-post-body] img')!.naturalHeight > 0)
      await expectActive(page, 'one')
      assert.equal(await page.evaluate(() => scrollY), position)
    }
    finally { release() }
  })

  for (const javaScriptEnabled of [true, false]) {
    harness.test(`mobile TOC supports keyboard links, dismissal and responsive scrolling${javaScriptEnabled ? '' : ' without JavaScript'}`, async (site) => {
      const { page, origin } = site
      const path = '/posts/formal-languages-and-complexity-notes'
      if (javaScriptEnabled)
        await openHydratedPage(site, path, '[data-post-body]')
      else
        await page.goto(`${origin}${path}`)
      const toggle = page.getByRole('checkbox', { name: '目录', exact: true })
      const trigger = page.locator('label[for="toc-toggle"]').last()
      const panel = page.locator('#page-toc')
      assert.equal(await panel.isVisible(), false)
      const position = await page.evaluate(() => {
        scrollTo(0, 1800)
        return scrollY
      })
      assert(position > 0)
      await toggle.focus()
      await page.keyboard.press('Space')
      await panel.waitFor({ state: 'visible' })
      const bounds = await panel.boundingBox()
      const triggerBounds = await trigger.boundingBox()
      assert(bounds && triggerBounds && bounds.x >= 0 && bounds.x + bounds.width <= 390)
      assert(bounds.y >= 64 && bounds.y + bounds.height < triggerBounds.y && triggerBounds.y + triggerBounds.height <= 844)
      assert(await panel.evaluate(element => element.scrollHeight > element.clientHeight))
      if (javaScriptEnabled) {
        await panel.hover()
        await page.mouse.wheel(0, 500)
        await page.waitForFunction(() => document.getElementById('page-toc')!.scrollTop > 0, undefined, { timeout: 5000 })
      }
      assert.equal(await page.evaluate(() => scrollY), position)
      await page.locator('label[for="toc-toggle"][aria-hidden]').click({ position: { x: 24, y: 120 } })
      await panel.waitFor({ state: 'hidden' })
      assert.equal(await page.evaluate(() => scrollY), position)
      await trigger.click()
      const link = panel.getByRole('link', { name: '绪论', exact: true })
      const id = await page.getByRole('heading', { name: '绪论', exact: true }).getAttribute('id')
      assert(id)
      assert.equal(await link.getAttribute('href'), `${path}#${id}`)
      await link.focus()
      await page.keyboard.press('Enter')
      await page.waitForURL(`${origin}${path}#${id}`)
      const selector = await page.evaluate(id => `#${CSS.escape(id)}`, id)
      if (javaScriptEnabled) {
        await expectSettledAnchor(page, selector)
        await panel.waitFor({ state: 'hidden' })
      }
      else {
        await expectAnchor(page, selector)
      }
      const items = await panel.locator('li').allTextContents()
      await page.setViewportSize({ width: 1280, height: 1000 })
      await panel.waitFor({ state: 'visible' })
      assert.equal(await trigger.isVisible(), false)
      assert.equal(await panel.evaluate(element => getComputedStyle(element).position), 'sticky')
      assert.deepEqual(await panel.locator('li').allTextContents(), items)
      await page.setViewportSize({ width: 1279, height: 1000 })
      if (await toggle.isChecked())
        await trigger.click()
      await panel.waitFor({ state: 'hidden' })
    }, { viewport: { width: 390, height: 844 }, javaScriptEnabled })
  }

  harness.test('TOC hydration preserves article geometry and heading labels', async ({ page, origin }) => {
    let release!: () => void
    const ready = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/assets/*.js', async (route) => {
      await ready
      await route.continue()
    })
    try {
      await page.goto(`${origin}${articleWithToc.path}`, { waitUntil: 'commit' })
      await page.locator('#toc-feature').waitFor({ state: 'visible' })
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#page-toc')!).position === 'sticky')
      const before = await page.locator('article').boundingBox()
      const labels = await page.locator('#page-toc li').allTextContents()
      assert.equal(await page.evaluate(() => !!document.querySelector('#app')?.__vue_app__), false)
      release()
      await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__)
      const after = await page.locator('article').boundingBox()
      assert(before && after)
      assert.equal(after.width, before.width)
      assert.equal(after.x, before.x)
      assert.deepEqual(await page.locator('#page-toc li').allTextContents(), labels)
    }
    finally { release() }
  })

  for (const { path, anchor } of [articleWithToc, archiveWithToc]) {
    harness.test(`TOC anchors, repeated clicks and saved reading positions survive history on ${path}`, async (site) => {
      const { page, origin } = site
      await openHydratedPage(site, `${path}${anchor}`, '#page-toc')
      await expectSettledAnchor(page, anchor)
      const next = page.locator(`#toc-${anchor.slice(1)} + li a`)
      const href = await next.getAttribute('href')
      assert(href)
      const nextHash = new URL(href, origin).hash
      await page.evaluate(() => scrollBy(0, 250))
      await page.locator(`#toc-${anchor.slice(1)} a`).click()
      await expectSettledAnchor(page, anchor)
      const position = await page.evaluate(() => {
        scrollBy(0, 250)
        return scrollY
      })
      await next.evaluate((link: HTMLAnchorElement) => link.click())
      await expectSettledAnchor(page, nextHash)
      await page.goBack()
      await page.waitForURL(`${origin}${path}${anchor}`)
      await page.waitForFunction(expected => Math.abs(scrollY - expected) < 5, position)
      await waitForScrollToSettle(page)
      assert(Math.abs(await page.evaluate(() => scrollY) - position) < 5)
      await page.goForward()
      await page.waitForURL(`${origin}${path}${nextHash}`)
      await expectSettledAnchor(page, nextHash)
    })
  }

  harness.test('TOC follows replacement headings when an SPA article reuses their ids', async (site) => {
    const { page } = site
    await openHydratedPage(site, articleWithToc.path, '#toc-feature')
    await page.locator('#toc-feature').click()
    await expectSettledAnchor(page, '#feature')
    await expectActive(page, 'feature')
    await mockNextPost(site, '<div style="height: 1500px"></div><h2 id="feature">Replacement heading</h2><div style="height: 1000px"></div>')
    await page.waitForFunction(() => document.getElementById('toc-feature')?.textContent?.trim() === 'Replacement heading')
    await expectActive(page, null)
    await page.locator('#toc-feature').click()
    await expectSettledAnchor(page, '#feature')
    await expectActive(page, 'feature')
  })

  harness.test('TOC closes on article changes, clears without headings and returns on cached re-entry', async (site) => {
    const { page } = site
    await openHydratedPage(site, articleWithToc.path, '#toc-feature')
    const labels = await page.locator('#page-toc li').allTextContents()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.locator('label[for="toc-toggle"]').last().click()
    const links = page.locator('article a[href^="/posts/"]')
    const target = await links.first().getAttribute('href')
    assert(target)
    await page.route(`**${target}.htm`, route => route.fulfill({ contentType: 'text/html', body: '<h2 id="temporary">Temporary heading</h2>' }))
    // Bypass the overlay: the article change itself must close the panel.
    await links.first().evaluate((link: HTMLAnchorElement) => link.click())
    await page.locator('#toc-temporary').waitFor({ state: 'attached' })
    assert.equal(await page.locator('#toc-toggle').isChecked(), false)
    await page.goBack()
    await page.locator('#toc-feature').waitFor({ state: 'attached' })
    const other = await links.last().getAttribute('href')
    assert(other && other !== target)
    await page.route(`**${other}.htm`, route => route.fulfill({ contentType: 'text/html', body: '<p>No headings fixture</p>' }))
    await page.setViewportSize({ width: 1440, height: 1000 })
    await links.last().click()
    await page.getByText('No headings fixture', { exact: true }).waitFor()
    assert.equal(await page.locator('#page-toc').count(), 0)
    await page.goBack()
    await page.locator('#toc-feature').waitFor({ state: 'visible' })
    await page.locator('#sidebar a[href="/archive"]').click()
    await page.locator('#toc-archive-2025').waitFor({ state: 'visible' })
    await page.locator(`main a[href="${articleWithToc.path}"]`).click()
    await page.locator('#toc-feature').waitFor({ state: 'visible' })
    assert.deepEqual(await page.locator('#page-toc li').allTextContents(), labels)
    await page.locator('#toc-feature').click()
    await expectSettledAnchor(page, '#feature')
    await expectActive(page, 'feature')
  })
}
