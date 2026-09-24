import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { launchBrowser, mockExternalServices, startServer } from '../helpers/browser-utils.ts'
import type { Page } from 'playwright'

const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
const browser = await launchBrowser()
const server = await startServer('dist')
const errors: string[] = []

async function openHydratedPage(page: Page, path: string, selector?: string) {
  const response = await page.goto(`${server.origin}${path}`)
  assert.equal(response.status(), 200, `${path} should be served`)
  await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  if (selector)
    await page.locator(selector).first().waitFor({ state: 'visible' })
}

try {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    viewport: { width: 1440, height: 1000 },
  })
  await mockExternalServices(context)
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Service Worker'))
      errors.push(message.text())
  })

  const staticRoutes = [
    ['/', '.show-more'],
    ['/about', '.md-blog'],
    ['/archive', '.archive-year-group'],
    ['/links', 'a[href^="https://"]'],
    ['/tags', 'a[href^="/tags/"]'],
    ['/bangumi', 'h1'],
  ]
  for (const [path, selector] of staticRoutes)
    await openHydratedPage(page, path, selector)

  await openHydratedPage(page, '/about', '.md-blog')
  await page.getByRole('link', { name: '动画' }).click()
  await page.waitForURL('**/bangumi')
  await page.getByRole('heading', { name: '动画列表' }).waitFor({ state: 'visible' })
  await page.goBack()
  await page.waitForURL('**/about')
  await page.locator('.md-blog').waitFor({ state: 'visible' })

  for (const post of posts) {
    const requests: string[] = []
    const onRequest = request => requests.push(request.url())
    page.on('request', onRequest)
    await openHydratedPage(page, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
    assert.equal(await page.locator('article h1').first().textContent(), post.title)
    assert(!requests.some(url => /\.htm$|\/page\.json|\/\?\//.test(url)), `Unexpected request for ${post.url}`)
    page.removeListener('request', onRequest)
  }

  await openHydratedPage(page, '/', undefined)
  const articleUrl = '/posts/sakurada-reset-map'
  await page.locator(`article a[href="${articleUrl}"]`).first().click()
  await page.waitForURL(`**${articleUrl}`)
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  await page.evaluate(() => window.scrollTo(0, 900))
  const articleScrollY = await page.evaluate(() => window.scrollY)
  assert(articleScrollY > 400, 'Article must be scrolled before history navigation')
  await page.goBack()
  await page.locator('.show-more').first().waitFor({ state: 'visible' })
  await page.goForward()
  await page.waitForURL(`**${articleUrl}`)
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  await page.waitForFunction(expected => Math.abs(window.scrollY - expected) < 120, articleScrollY, {})

  await openHydratedPage(page, '/archive', '.archive-item')
  await page.locator('.archive-item').first().click()
  await page.waitForURL('**/posts/**')
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  const archivePostTitle = await page.locator('article h1').first().textContent()
  await page.goBack()
  await page.locator('.archive-item').first().waitFor({ state: 'visible' })
  await page.locator('.archive-item').filter({ hasText: archivePostTitle }).waitFor({ state: 'visible' })

  await openHydratedPage(page, '/tags', 'a[href^="/tags/"]')
  const tagUrl = await page.locator('a[href^="/tags/"]').first().getAttribute('href')
  await openHydratedPage(page, tagUrl, '.grid a[href^="/posts/"]')
  const taggedPost = page.locator('.grid a[href^="/posts/"]').first()
  await taggedPost.waitFor({ state: 'visible' })
  await taggedPost.click()
  await page.waitForURL('**/posts/**')
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  await page.goBack()
  await page.waitForURL(`**${tagUrl}`)
  await page.locator('.grid a[href^="/posts/"]').first().waitFor({ state: 'visible' })

  await openHydratedPage(page, '/posts/hello-world#feature', '#toc-feature')
  const relatedArticle = page.locator('article a[href^="/posts/"]').first()
  const relatedUrl = await relatedArticle.getAttribute('href')
  await relatedArticle.click()
  await page.waitForURL(`**${relatedUrl}`)
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  await page.goBack()
  await page.waitForURL(`**/posts/hello-world#feature`)
  await page.locator('#toc-feature').waitFor({ state: 'visible' })
  assert.equal(await page.locator('article h1').first().textContent(), 'Hello New World')
  await page.goForward()
  await page.waitForURL(`**${relatedUrl}`)
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })

  await openHydratedPage(page, '/posts/hello-world.html?test=1#feature', '#toc-feature')
  await page.waitForURL(`${server.origin}/posts/hello-world?test=1#feature`)
  assert.equal(await page.locator('article h1').first().textContent(), 'Hello New World')
  await context.close()

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
    serviceWorkers: 'block',
  })
  await mockExternalServices(mobile)
  const mobilePage = await mobile.newPage()
  mobilePage.on('pageerror', error => errors.push(String(error)))
  await openHydratedPage(mobilePage, '/posts/hello-world', undefined)
  assert(await mobilePage.locator('html').evaluate(element => element.classList.contains('dark')))
  assert(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await mobilePage.getByRole('button', { name: 'menu' }).click()
  await mobilePage.waitForFunction(() => document.querySelector('#sidebar')?.classList.contains('sidebar-open'), undefined, {})
  await mobile.close()

  const sw = await browser.newContext()
  await mockExternalServices(sw)
  const swPage = await sw.newPage()
  await openHydratedPage(swPage, '/posts/hello-world', undefined)
  await swPage.evaluate(() => navigator.serviceWorker.ready)
  await swPage.reload()
  await swPage.locator('[data-post-body]').waitFor({ state: 'visible' })
  await swPage.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  await sw.close()
}
finally {
  await browser.close()
  await server.close()
}

console.warn(JSON.stringify({ articles: posts.length, staticRoutes: 6, navigation: true, errors }))
assert.deepEqual(errors, [])
