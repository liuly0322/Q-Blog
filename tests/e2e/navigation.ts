import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { articleWithToc, openHydratedPage, scrollArticle } from '../helpers/site.ts'
import type { Site } from '../helpers/site.ts'

export function registerNavigation(site: Site) {
  const { page } = site

  test('header navigation reaches the next route and Back returns', async () => {
    await openHydratedPage(site, '/about', '.md-blog')
    await page.getByRole('link', { name: '动画' }).click()
    await page.waitForURL('**/bangumi')
    await page.getByRole('heading', { name: '动画列表' }).waitFor({ state: 'visible' })
    await page.goBack()
    await page.waitForURL('**/about')
    await page.locator('.md-blog').waitFor({ state: 'visible' })
  })

  test('article scroll position survives Back and Forward', async () => {
    await openHydratedPage(site, '/')
    await page.locator(`article a[href="${scrollArticle}"]`).first().click()
    await page.waitForURL(`**${scrollArticle}`)
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    await page.evaluate(() => window.scrollTo(0, 900))
    const articleScrollY = await page.evaluate(() => window.scrollY)
    assert(articleScrollY > 400, 'Article must be scrolled before history navigation')
    await page.goBack()
    await page.locator('.show-more').first().waitFor({ state: 'visible' })
    await page.goForward()
    await page.waitForURL(`**${scrollArticle}`)
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    await page.waitForFunction(expected => Math.abs(window.scrollY - expected) < 120, articleScrollY, {})
  })

  test('archive returns to the clicked entry after Back', async () => {
    await openHydratedPage(site, '/archive', '.archive-item')
    await page.locator('.archive-item').first().click()
    await page.waitForURL('**/posts/**')
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    const archivePostTitle = await page.locator('article h1').first().textContent()
    await page.goBack()
    await page.locator('.archive-item').first().waitFor({ state: 'visible' })
    await page.locator('.archive-item').filter({ hasText: archivePostTitle }).waitFor({ state: 'visible' })
  })

  test('tag page returns to the card list after Back', async () => {
    await openHydratedPage(site, '/tags', 'a[href^="/tags/"]')
    const tagUrl = await page.locator('a[href^="/tags/"]').first().getAttribute('href')
    await openHydratedPage(site, tagUrl, '.grid a[href^="/posts/"]')
    const taggedPost = page.locator('.grid a[href^="/posts/"]').first()
    await taggedPost.waitFor({ state: 'visible' })
    await taggedPost.click()
    await page.waitForURL('**/posts/**')
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    await page.goBack()
    await page.waitForURL(`**${tagUrl}`)
    await page.locator('.grid a[href^="/posts/"]').first().waitFor({ state: 'visible' })
  })

  test('table of contents anchor survives Back and Forward', async () => {
    await openHydratedPage(site, `${articleWithToc.path}${articleWithToc.anchor}`, '#toc-feature')
    const relatedArticle = page.locator('article a[href^="/posts/"]').first()
    const relatedUrl = await relatedArticle.getAttribute('href')
    await relatedArticle.click()
    await page.waitForURL(`**${relatedUrl}`)
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    await page.goBack()
    await page.waitForURL(`**${articleWithToc.path}${articleWithToc.anchor}`)
    await page.locator('#toc-feature').waitFor({ state: 'visible' })
    assert.equal(await page.locator('article h1').first().textContent(), articleWithToc.title)
    await page.goForward()
    await page.waitForURL(`**${relatedUrl}`)
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  })

  test('.html URLs are normalized on the client', async () => {
    await openHydratedPage(site, '/posts/hello-world.html?test=1#feature', '#toc-feature')
    await page.waitForURL(`${site.origin}${articleWithToc.path}?test=1${articleWithToc.anchor}`)
    assert.equal(await page.locator('article h1').first().textContent(), articleWithToc.title)
  })
}
