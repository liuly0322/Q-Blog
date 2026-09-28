import type { Site, SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { clickNav, expectArticle, expectTitle, openHydratedPage, posts, ssgTitle } from '../helpers/site.ts'

const SITE_TITLE = 'llyのblog'

async function expectDirectEntry(site: Site, path: string, expected: string) {
  const response = await site.page.goto(`${site.origin}${path}`)
  const ssg = await ssgTitle(response, site.page)
  await site.page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  assert.equal(ssg, expected, `${path}: SSG <title> must already be final`)
  await expectTitle(site.page, expected)
}

export function registerTitles(harness: SiteHarness) {
  const [post] = posts
  const [tag] = post.tags

  harness.test('SSG title matches the hydrated title on a tag page', async (site) => {
    await expectDirectEntry(site, `/tags/${encodeURIComponent(tag)}`, `${tag} | ${SITE_TITLE}`)
  })

  harness.test('title follows navigation away from a tag page', async (site) => {
    const { page } = site
    await openHydratedPage(site, `/tags/${encodeURIComponent(tag)}`)
    await expectTitle(page, `${tag} | ${SITE_TITLE}`)
    await clickNav(site, 'a[href="/"]', '/')
    await expectTitle(page, SITE_TITLE)
  })

  harness.test('title follows navigation out of an article', async (site) => {
    const { page } = site
    await openHydratedPage(site, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
    await expectTitle(page, `${post.title} | ${SITE_TITLE}`)
    await clickNav(site, 'a[href="/archive"]', '/archive')
    await expectTitle(page, `归档 | ${SITE_TITLE}`)
  })

  harness.test('title follows navigation between two articles', async (site) => {
    const { page } = site
    await openHydratedPage(site, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
    const related = page.locator('article a[href^="/posts/"]').first()
    const relatedUrl = await related.getAttribute('href')
    const target = posts.find(post => `/posts/${encodeURIComponent(post.url)}` === relatedUrl)
    assert(target, 'Related link must identify a known article')
    await related.click()
    await page.waitForURL(`**${relatedUrl}`)
    await expectArticle(page, relatedUrl)
    await expectTitle(page, `${target.title} | ${SITE_TITLE}`)
  })

  harness.test('title follows SPA navigation across static routes', async (site) => {
    const { page } = site
    await openHydratedPage(site, '/')
    await expectTitle(page, SITE_TITLE)
    await clickNav(site, 'a[href="/about"]', '/about')
    await expectTitle(page, `关于 | ${SITE_TITLE}`)
    await page.locator('.md-blog').waitFor({ state: 'visible' })
    await clickNav(site, 'a[href="/bangumi"]', '/bangumi')
    await expectTitle(page, `动画列表 | ${SITE_TITLE}`)
    await page.getByRole('heading', { name: '动画列表' }).waitFor({ state: 'visible' })
    await page.goBack()
    await page.waitForURL(url => new URL(url).pathname === '/about')
    await expectTitle(page, `关于 | ${SITE_TITLE}`)
    await page.locator('.md-blog').waitFor({ state: 'visible' })
    await page.goForward()
    await page.waitForURL(url => new URL(url).pathname === '/bangumi')
    await expectTitle(page, `动画列表 | ${SITE_TITLE}`)
    await page.getByRole('heading', { name: '动画列表' }).waitFor({ state: 'visible' })
    await clickNav(site, 'a[href="/tags"]', '/tags')
    await expectTitle(page, `标签 | ${SITE_TITLE}`)
  })

  harness.test('404 redirect preserves path, query and hash and renders the fallback', async (site) => {
    const { page } = site
    const target = `${site.origin}/no-such-path?test=a%26b&other=2#feature`
    site.expectHttpError(target.split('#')[0], 404)
    const response = await page.goto(target)
    assert.equal(response.status(), 404)
    await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__)
    await page.waitForURL(target)
    await page.getByRole('heading', { name: '404', exact: true }).waitFor({ state: 'visible' })
    await expectTitle(page, SITE_TITLE)
    await page.getByRole('link', { name: '返回首页' }).click()
    await page.waitForURL(`${site.origin}/`)
    await page.locator('.show-more').first().waitFor({ state: 'visible' })
  })
}
