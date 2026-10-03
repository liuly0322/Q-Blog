import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { articleWithToc, expectAnchor, expectArticle, expectArticleSnippet, openHydratedPage, posts, scrollArticle } from '../helpers/site.ts'

export function registerNavigation(harness: SiteHarness) {
  for (const path of ['/', scrollArticle]) {
    harness.test(`hydration preserves manual scrolling on ${path}`, async ({ page, origin }) => {
      let release!: () => void
      const ready = new Promise<void>((resolve) => {
        release = resolve
      })
      await page.route('**/assets/*.js', async (route) => {
        await ready
        await route.continue()
      })
      try {
        await page.goto(`${origin}${path}`, { waitUntil: 'commit' })
        await page.locator('main article').first().waitFor({ state: 'visible' })
        await page.waitForFunction(() => getComputedStyle(document.querySelector('main')!).textAlign === 'center')
        assert.equal(await page.evaluate(() => !!document.querySelector('#app')?.__vue_app__), false)
        const before = await page.evaluate(() => {
          window.scrollTo(0, 900)
          return window.scrollY
        })
        assert(before > 500, 'The static page must be scrolled before hydration')
        release()
        await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__)
        await page.waitForLoadState('load')
        const after = await page.evaluate(() => new Promise<number>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY)))
        }))
        assert(Math.abs(after - before) < 5, `Hydration changed scroll position from ${before} to ${after}`)
      }
      finally {
        release()
      }
    })
  }

  for (const source of ['/archive', scrollArticle]) {
    harness.test(`article loading starts at the top when entering from ${source}`, async (site) => {
      const { page } = site
      const target = '/posts/programming-live-webpage'
      await openHydratedPage(site, source, source === '/archive' ? 'a[href^="/posts/"]' : '[data-post-body]')
      await page.evaluate(() => window.scrollTo(0, 900))
      assert(await page.evaluate(() => scrollY > 500))

      let release!: () => void
      const ready = new Promise<void>((resolve) => {
        release = resolve
      })
      await page.route(`**${target}.htm`, async (route) => {
        await ready
        await route.continue()
      })
      try {
        // Preserve the starting scroll position instead of scrolling the link into view.
        await page.locator(`a[href="${target}"]`).first().evaluate((link: HTMLAnchorElement) => link.click())
        await page.waitForURL(`**${target}`)
        await page.locator('article div.animate-pulse').waitFor({ state: 'visible' })
        const position = await page.evaluate(() => new Promise<number>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(scrollY)))
        }))
        assert.equal(position, 0, 'The article header must be visible while its body is loading')
      }
      finally {
        release()
        await expectArticle(page, target)
      }
    }, { viewport: { width: 844, height: 390 } })
  }

  harness.test('cached article navigation starts at the top', async (site) => {
    const { page } = site
    const target = '/posts/programming-live-webpage'
    let requests = 0
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === `${target}.htm`)
        requests++
    })
    await openHydratedPage(site, scrollArticle, '[data-post-body]')
    const link = page.locator(`article a[href="${target}"]`)
    await link.evaluate((element: HTMLAnchorElement) => element.click())
    await expectArticle(page, target)
    await page.goBack()
    await expectArticleSnippet(page, scrollArticle)
    await page.evaluate(() => window.scrollTo(0, 900))
    assert(await page.evaluate(() => scrollY > 500))
    await link.evaluate((element: HTMLAnchorElement) => element.click())
    await expectArticle(page, target)
    await page.waitForFunction(() => scrollY === 0)
    assert.equal(requests, 1, 'The second visit must use cached article content')
  })

  harness.test('article scroll position survives Back and Forward', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/')
    await page.locator(`article a[href="${scrollArticle}"]`).first().click()
    await page.waitForURL(`**${scrollArticle}`)
    await expectArticleSnippet(page, scrollArticle)
    await page.evaluate(() => window.scrollTo(0, 900))
    const articleScrollY = await page.evaluate(() => window.scrollY)
    assert(articleScrollY > 400, 'Article must be scrolled before history navigation')
    await page.goBack()
    await page.locator('.show-more').first().waitFor({ state: 'visible' })
    await page.goForward()
    await page.waitForURL(`**${scrollArticle}`)
    await expectArticleSnippet(page, scrollArticle)
    await page.waitForFunction(expected => Math.abs(window.scrollY - expected) < 120, articleScrollY, {})
  })

  harness.test('two articles keep their own scroll positions through Back and Forward', async (site) => {
    const { page } = site
    const secondArticle = '/posts/programming-live-webpage'
    await openHydratedPage(site, scrollArticle, '[data-post-body]')
    await expectArticleSnippet(page, scrollArticle)
    await page.evaluate(() => window.scrollTo(0, 900))
    const firstPosition = await page.evaluate(() => scrollY)
    assert(firstPosition > 500)

    await page.locator(`article a[href="${secondArticle}"]`).evaluate((link: HTMLAnchorElement) => link.click())
    await page.waitForURL(`**${secondArticle}`)
    await expectArticle(page, secondArticle)
    await page.evaluate(() => window.scrollTo(0, 500))
    const secondPosition = await page.evaluate(() => scrollY)
    assert(secondPosition > 300)

    await page.goBack()
    await page.waitForURL(`**${scrollArticle}`)
    await expectArticleSnippet(page, scrollArticle)
    await page.waitForFunction(expected => Math.abs(scrollY - expected) < 120, firstPosition)

    await page.goForward()
    await page.waitForURL(`**${secondArticle}`)
    await expectArticle(page, secondArticle)
    await page.waitForFunction(expected => Math.abs(scrollY - expected) < 120, secondPosition)
  })

  harness.test('archive returns to the clicked entry after Back', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/archive', 'a[href^="/posts/"]')
    const entry = page.locator(`main a[href="${articleWithToc.path}"]`)
    const target = '/posts/hello-world' as const
    await entry.scrollIntoViewIfNeeded()
    const position = await page.evaluate(() => scrollY)
    assert(position > 400, 'Choose an archive entry below the first viewport')
    await entry.click()
    await page.waitForURL(`**${target}`)
    await expectArticleSnippet(page, target)
    await page.goBack()
    await page.waitForURL('**/archive')
    await page.waitForFunction(expected => Math.abs(scrollY - expected) < 120, position)
    assert(await entry.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= innerHeight
    }))
  })

  harness.test('tag page returns to the card list after Back', async (site) => {
    const { page } = site
    const tagUrl = '/tags/Vue'
    await openHydratedPage(site, tagUrl, '.grid a[href^="/posts/"]')
    const taggedPost = page.locator(`.grid a[href="${articleWithToc.path}"]`)
    await taggedPost.waitFor({ state: 'visible' })
    const target = '/posts/hello-world' as const
    await taggedPost.click()
    await page.waitForURL('**/posts/**')
    await expectArticleSnippet(page, target)
    await page.goBack()
    await page.waitForURL(`**${tagUrl}`)
    await page.locator('.grid a[href^="/posts/"]').first().waitFor({ state: 'visible' })
  })

  harness.test('table of contents anchor survives Back and Forward', async (site) => {
    const { page } = site
    await openHydratedPage(site, `${articleWithToc.path}${articleWithToc.anchor}`, '#toc-feature')
    await expectAnchor(page, articleWithToc.anchor)
    const relatedUrl = '/posts/github-actions-ci' as const
    const relatedArticle = page.locator(`article a[href="${relatedUrl}"]`)
    // Leave from the heading: scrolling the footer link into view would save
    // that reading position, which must take precedence over the URL hash.
    await relatedArticle.evaluate((link: HTMLAnchorElement) => link.click())
    await page.waitForURL(`**${relatedUrl}`)
    await expectArticleSnippet(page, relatedUrl)
    await page.goBack()
    await page.waitForURL(`**${articleWithToc.path}${articleWithToc.anchor}`)
    await expectAnchor(page, articleWithToc.anchor)
    assert.equal(await page.locator('article h1').first().textContent(), articleWithToc.title)
    await page.goForward()
    await page.waitForURL(`**${relatedUrl}`)
    await expectArticleSnippet(page, relatedUrl)
  })

  harness.test('.html URLs are normalized on the client', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/posts/hello-world.html?test=1#feature', '#toc-feature')
    await page.waitForURL(`${site.origin}${articleWithToc.path}?test=1${articleWithToc.anchor}`)
    assert.equal(await page.locator('article h1').first().textContent(), articleWithToc.title)
    await expectAnchor(page, articleWithToc.anchor)
  })

  harness.test('clicking the table of contents scrolls to the body heading', async (site) => {
    await openHydratedPage(site, articleWithToc.path, '#toc-feature')
    await site.page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    await site.page.locator('#toc-feature').click()
    await expectAnchor(site.page, articleWithToc.anchor)
  })

  harness.test('homepage pagination and scroll survive an article round trip', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/', '.show-more')
    const target = '/posts/senior-year' as const
    const index = posts.findIndex(post => `/posts/${post.url}` === target)
    const pageNumber = Math.floor(index / 10) + 1
    assert(pageNumber > 1, 'Pagination fixture must be beyond the first page')
    await page.locator('span.cursor-pointer').filter({ hasText: new RegExp(`^${pageNumber}$`) }).click()
    const expected = posts.slice((pageNumber - 1) * 10, pageNumber * 10).map(post => `/posts/${encodeURIComponent(post.url)}`)
    const cards = page.locator('a.show-more[href^="/posts/"]')
    await page.waitForFunction(href => document.querySelector('a.show-more')?.getAttribute('href') === href, expected[0])
    assert.deepEqual(await cards.evaluateAll(elements => elements.map(el => el.getAttribute('href'))), expected)
    const entry = page.locator(`a.show-more[href="${target}"]`)
    await entry.scrollIntoViewIfNeeded()
    const position = await page.evaluate(() => scrollY)
    assert(position > 400)
    await entry.click()
    await page.waitForURL(`**${target}`)
    await expectArticleSnippet(page, target)
    await page.goBack()
    await page.waitForURL(`${site.origin}/`)
    await page.waitForFunction(expected => Math.abs(scrollY - expected) < 120, position)
    assert.deepEqual(await cards.evaluateAll(elements => elements.map(el => el.getAttribute('href'))), expected)

    await entry.click()
    await page.waitForURL(`**${target}`)
    await page.locator('header a[href="/"]').first().click()
    await page.waitForURL(`${site.origin}/`)
    await page.waitForFunction(href => document.querySelector('a.show-more')?.getAttribute('href') === href, `/posts/${posts[0].url}`)
    await page.waitForFunction(() => scrollY === 0)
    assert.equal(await page.evaluate(() => scrollY), 0)
  })

  harness.test('a late article response cannot overwrite the page after Back', async (site) => {
    const { page } = site
    await openHydratedPage(site, articleWithToc.path, '[data-post-body]')
    const link = page.locator('article a[href^="/posts/"]').first()
    const target = await link.getAttribute('href')
    // Hold the response until after Back. Honor aborts, but do not require them:
    // cancelling the fetch and ignoring stale results are both valid strategies.
    await page.evaluate((url) => {
      const originalFetch = window.fetch.bind(window)
      window.fetch = (input, init) => String(input) === url
        ? new Promise<Response>((resolve, reject) => {
          window.releaseArticle = () => resolve(new Response('<p>Late stale body</p>'))
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
        })
        : originalFetch(input, init)
    }, `${target}.htm`)
    await link.click()
    await page.waitForFunction(() => typeof window.releaseArticle === 'function')
    await page.goBack()
    await page.waitForURL(`**${articleWithToc.path}`)
    await page.evaluate(async () => {
      window.releaseArticle()
      // Flush the fetch continuation and Vue update before asserting the result.
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    await expectArticleSnippet(page, '/posts/hello-world')
    assert(!(await page.locator('[data-post-body]').textContent()).includes('Late stale body'))
    await page.locator('article div.animate-pulse').waitFor({ state: 'hidden' })
  })

  harness.test('failed article loading shows a useful error and navigation recovers', async (site) => {
    const { page } = site
    const resource = `${site.origin}${scrollArticle}.htm`
    site.expectHttpError(resource, 503)
    await page.route(resource, route => route.fulfill({ status: 503, body: 'Unavailable' }))
    await openHydratedPage(site, '/', '.show-more')
    await page.locator(`article a[href="${scrollArticle}"]`).first().click()
    await page.waitForURL(`**${scrollArticle}`)
    await page.getByText('文章加载失败，请刷新重试。', { exact: true }).waitFor({ state: 'visible' })
    await page.locator('article div.animate-pulse').waitFor({ state: 'hidden' })
    await page.goBack()
    await page.waitForURL(`${site.origin}/`)
    await page.unroute(resource)
    await page.locator(`article a[href="${scrollArticle}"]`).first().click()
    await page.waitForURL(`**${scrollArticle}`)
    await expectArticleSnippet(page, scrollArticle)
  })
}
