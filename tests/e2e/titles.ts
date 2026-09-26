import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { clickNav, expectTitle, openHydratedPage, posts, ssgTitle } from '../helpers/site.ts'
import type { Site } from '../helpers/site.ts'

const SITE_TITLE = 'llyのblog'

// 故意写成字面量：不 import src/pageMeta.ts，否则标题表改错测试会跟着一起错
const staticRoutes: [string, string][] = [
  ['/', SITE_TITLE],
  ['/about', `关于 | ${SITE_TITLE}`],
  ['/archive', `归档 | ${SITE_TITLE}`],
  ['/links', `友情链接 | ${SITE_TITLE}`],
  ['/tags', `标签 | ${SITE_TITLE}`],
  ['/bangumi', `动画列表 | ${SITE_TITLE}`],
]

async function expectDirectEntry(site: Site, path: string, expected: string) {
  const response = await site.page.goto(`${site.origin}${path}`)
  const ssg = await ssgTitle(response)
  await site.page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  assert.equal(ssg, expected, `${path}: SSG <title> must already be final`)
  await expectTitle(site.page, expected)
}

export function registerTitles(site: Site) {
  const { page } = site
  const [post] = posts
  const [tag] = post.tags

  for (const [path, expected] of staticRoutes) {
    test(`SSG title matches the hydrated title on ${path}`, async () => {
      await expectDirectEntry(site, path, expected)
    })
  }

  test('SSG title matches the hydrated title on an article', async () => {
    await expectDirectEntry(site, `/posts/${encodeURIComponent(post.url)}`, `${post.title} | ${SITE_TITLE}`)
  })

  test('SSG title matches the hydrated title on a tag page', async () => {
    await expectDirectEntry(site, `/tags/${encodeURIComponent(tag)}`, `${tag} | ${SITE_TITLE}`)
  })

  test('title follows navigation away from a tag page', async () => {
    await openHydratedPage(site, `/tags/${encodeURIComponent(tag)}`)
    await expectTitle(page, `${tag} | ${SITE_TITLE}`)
    await clickNav(site, 'a[href="/"]', '/')
    await expectTitle(page, SITE_TITLE)
  })

  test('title follows navigation out of an article', async () => {
    await openHydratedPage(site, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
    await expectTitle(page, `${post.title} | ${SITE_TITLE}`)
    await clickNav(site, 'a[href="/archive"]', '/archive')
    await expectTitle(page, `归档 | ${SITE_TITLE}`)
  })

  test('title follows navigation between two articles', async () => {
    await openHydratedPage(site, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
    const related = page.locator('article a[href^="/posts/"]').first()
    const relatedUrl = await related.getAttribute('href')
    await related.click()
    await page.waitForURL(`**${relatedUrl}`)
    await page.locator('[data-post-body]').waitFor({ state: 'visible' })
    await expectTitle(page, `${await page.locator('article h1').first().textContent()} | ${SITE_TITLE}`)
  })

  test('title follows SPA navigation across static routes', async () => {
    await openHydratedPage(site, '/')
    await expectTitle(page, SITE_TITLE)
    await clickNav(site, 'a[href="/about"]', '/about')
    await expectTitle(page, `关于 | ${SITE_TITLE}`)
    await clickNav(site, 'a[href="/bangumi"]', '/bangumi')
    await expectTitle(page, `动画列表 | ${SITE_TITLE}`)
    await page.goBack()
    await page.waitForURL(url => new URL(url).pathname === '/about')
    await expectTitle(page, `关于 | ${SITE_TITLE}`)
    await page.goForward()
    await page.waitForURL(url => new URL(url).pathname === '/bangumi')
    await expectTitle(page, `动画列表 | ${SITE_TITLE}`)
    await clickNav(site, 'a[href="/tags"]', '/tags')
    await expectTitle(page, `标签 | ${SITE_TITLE}`)
  })

  test('SPA fallback entry keeps the site title', async () => {
    // 直接进 spa.html?/path：404.html 那一跳会带回一个 404 响应，浏览器必然记一条资源错误
    await page.goto(`${site.origin}/spa.html?/no-such-path`)
    await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
    assert.equal(await page.evaluate(() => location.pathname), '/no-such-path')
    await expectTitle(page, SITE_TITLE)
  })
}
