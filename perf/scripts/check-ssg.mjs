import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { launchBrowser, mockExternalServices, startServer } from './ssg-browser-utils.mjs'

const {
  posts,
} = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
const browser = await launchBrowser()
const server = await startServer('dist')
const result = {
  articles: 0,
  nojs: 0,
  errors: [],
}
try {
  for (const enabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled: enabled,
      serviceWorkers: 'block',
      viewport: {
        width: 1440,
        height: 1000,
      },
    })
    await mockExternalServices(context)
    const page = await context.newPage()
    page.on('pageerror', e => result.errors.push(String(e)))
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().includes('Service Worker'))
        result.errors.push(m.text())
    })
    for (const post of posts) {
      const requests = []
      const onRequest = r => requests.push(r.url())
      page.on('request', onRequest)
      const response = await page.goto(`${server.origin}/posts/${encodeURIComponent(post.url)}`)
      assert.equal(response.status(), 200)
      await page.locator('[data-post-body]').waitFor({
        state: 'visible',
      })
      if (enabled)
        await page.waitForFunction(() => !!document.querySelector('#app').__vue_app__)
      assert.equal(await page.locator('article h1').first().textContent(), post.title)
      assert(!requests.some(u => /\.htm$|\/page\.json|\/\?\//.test(u)), `Unexpected request for ${post.url}`)
      page.removeListener('request', onRequest)
      result[enabled ? 'articles' : 'nojs']++
    }
    if (enabled) {
      await page.goto(`${server.origin}/posts/hello-world#feature`)
      await page.waitForFunction(() => !!document.querySelector('#app').__vue_app__)
      await page.locator('#toc-feature').waitFor({
        state: 'visible',
      })
      const first = await page.locator('article a[href^="/posts/"]').first().getAttribute('href')
      await page.locator('article a[href^="/posts/"]').first().click()
      await page.waitForURL(`**${first}`)
      await page.locator('[data-post-body]').waitFor({
        state: 'visible',
      })
      await page.goBack()
      await page.locator('[data-post-body]').waitFor({
        state: 'visible',
      })
      assert.equal(await page.locator('article h1').first().textContent(), 'Hello New World')
      await page.locator('header a[href="/"]').first().click()
      await page.locator('.show-more').first().waitFor({
        state: 'visible',
      })
      await page.locator('.show-more').first().click()
      await page.locator('[data-post-body]').waitFor({
        state: 'visible',
      })
      await page.goto(`${server.origin}/posts/hello-world.html?test=1#feature`)
      await page.waitForFunction(() => !!document.querySelector('#app').__vue_app__)
      assert.equal(await page.locator('article h1').first().textContent(), 'Hello New World')
      result.navigation = true
    }
    await context.close()
  }
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', serviceWorkers: 'block' })
  await mockExternalServices(mobile)
  const page = await mobile.newPage()
  page.on('pageerror', error => result.errors.push(String(error)))
  await page.goto(`${server.origin}/posts/hello-world`)
  await page.waitForFunction(() => !!document.querySelector('#app').__vue_app__)
  assert(await page.locator('html').evaluate(element => element.classList.contains('dark')))
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.getByRole('button', { name: 'menu' }).click()
  await page.waitForFunction(() => document.querySelector('#sidebar').classList.contains('sidebar-open'))
  await mobile.close()
  result.mobileDark = true

  const sw = await browser.newContext()
  await mockExternalServices(sw)
  const swPage = await sw.newPage()
  await swPage.goto(`${server.origin}/posts/hello-world`)
  await swPage.evaluate(() => navigator.serviceWorker.ready)
  await swPage.reload()
  await swPage.locator('[data-post-body]').waitFor({ state: 'visible' })
  await swPage.waitForFunction(() => !!document.querySelector('#app').__vue_app__)
  await sw.close()
  result.serviceWorker = true
}
finally {
  await browser.close()
  await server.close()
}
console.warn(JSON.stringify(result))
assert.deepEqual(result.errors, [])
