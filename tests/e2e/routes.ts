import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { expectArticle, expectTitle, openHydratedPage, posts, ssgTitle } from '../helpers/site.ts'

// Literal expectations intentionally independent of the application metadata.
const staticRoutes: [string, string, string][] = [
  ['/', '.show-more', 'llyのblog'],
  ['/about', '.md-blog', '关于 | llyのblog'],
  ['/archive', 'main h2[id^="archive-"]', '归档 | llyのblog'],
  ['/links', 'main a[href^="https://"]', '友情链接 | llyのblog'],
  ['/tags', 'a[href^="/tags/"]', '标签 | llyのblog'],
  ['/bangumi', 'h1', '动画列表 | llyのblog'],
]

export function registerRoutes(harness: SiteHarness) {
  for (const [path, selector, title] of staticRoutes) {
    harness.test(`static route ${path} hydrates from its SSG output`, async (site) => {
      const response = await openHydratedPage(site, path, selector)
      assert.equal(await ssgTitle(response, site.page), title, `${path}: static title`)
      await expectTitle(site.page, title)
    })
  }

  const pageMax = Math.ceil(posts.length / 10)
  for (let pageNumber = 1; pageNumber <= pageMax; pageNumber++) {
    const path = pageNumber === 1 ? '/' : `/${pageNumber}`
    harness.test(`homepage ${path} hydrates without downloading its excerpts again`, async (site) => {
      const requests: string[] = []
      const documents: string[] = []
      site.page.on('request', (request) => {
        requests.push(new URL(request.url()).pathname)
        if (request.isNavigationRequest() && request.frame() === site.page.mainFrame())
          documents.push(request.url())
      })
      const response = await openHydratedPage(site, path, '.show-more')
      const title = pageNumber === 1 ? 'llyのblog' : `第 ${pageNumber} 页 | llyのblog`
      assert.equal(await ssgTitle(response, site.page), title)
      await expectTitle(site.page, title)
      const expected = posts.slice((pageNumber - 1) * 10, pageNumber * 10).map(post => `/posts/${encodeURIComponent(post.url)}`)
      assert.deepEqual(await site.page.locator('a.show-more').evaluateAll(links => links.map(link => link.getAttribute('href'))), expected)
      assert.equal((await site.page.getByRole('navigation', { name: '文章分页' }).locator('[aria-current="page"]').textContent())?.trim(), String(pageNumber))
      assert.deepEqual(documents, [`${site.origin}${path}`], 'Direct entry must use its own static document')
      assert(!requests.some(path => /home-page-\d|\/page\.json$|\/spa\.html$/.test(path)), `Unexpected homepage data request: ${requests}`)
    })
  }

  for (const post of posts) {
    harness.test(`article ${post.url} hydrates from its own SSG output`, async (site) => {
      const requests: string[] = []
      const documents: string[] = []
      site.page.on('request', (request) => {
        requests.push(new URL(request.url()).pathname)
        if (request.isNavigationRequest() && request.frame() === site.page.mainFrame())
          documents.push(request.url())
      })
      const url = `${site.origin}/posts/${encodeURIComponent(post.url)}`
      const response = await openHydratedPage(site, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
      await expectArticle(site.page, `/posts/${encodeURIComponent(post.url)}`)
      assert.equal(site.page.url(), url, 'Direct entry must keep the article URL')
      assert.deepEqual(documents, [url], 'Direct entry must not redirect or reload through a fallback')
      assert.equal(await ssgTitle(response, site.page), `${post.title} | llyのblog`)
      await expectTitle(site.page, `${post.title} | llyのblog`)
      assert(!requests.some(url => /\.htm$|^\/page\.json$|^\/spa\.html$/.test(url)), `Unexpected request for ${post.url}: ${requests}`)
    })
  }

  for (const route of ['/', '/2', `/${pageMax}`, '/archive', `/tags/${encodeURIComponent(posts[0].tags[0])}`, '/posts/hello-world']) {
    harness.test(`SSG content is usable without JavaScript on ${route}`, async (site) => {
      const response = await site.page.goto(site.origin + route)
      assert.equal(response.status(), 200)
      if (route.startsWith('/posts/')) {
        await expectArticle(site.page, route)
      }
      else {
        const isHomepage = route === '/' || /^\/\d+$/.test(route)
        const pageNumber = route === '/' ? 1 : Number(route.slice(1))
        const expected = isHomepage
          ? posts.slice((pageNumber - 1) * 10, pageNumber * 10)
          : route === '/archive'
            ? posts
            : posts.filter(post => post.tags.includes(posts[0].tags[0]))
        const selector = isHomepage ? 'a.show-more' : route === '/archive' ? 'main a[href^="/posts/"]' : '.grid a[href^="/posts/"]'
        await site.page.locator(selector).first().waitFor({ state: 'visible' })
        const links = await site.page.locator(selector).evaluateAll(elements => elements.map(el => decodeURIComponent(el.getAttribute('href'))))
        assert.deepEqual(links, expected.map(post => `/posts/${post.url}`))
        if (isHomepage) {
          await site.page.locator('.md-blog-home').first().waitFor({ state: 'visible' })
          const excerpts = await site.page.locator('.md-blog-home').allTextContents()
          assert.equal(excerpts.length, expected.length)
          assert(excerpts.every(text => text.trim().length > 0))
        }
      }
    }, { javaScriptEnabled: false })
  }

  harness.test('homepage links navigate and reload without JavaScript', async (site) => {
    const { page } = site
    await page.goto(`${site.origin}/`)
    const pagination = page.getByRole('navigation', { name: '文章分页' })
    await pagination.getByRole('link', { name: '2', exact: true }).click()
    await page.waitForURL(`${site.origin}/2`)
    const expected = posts.slice(10, 20).map(post => `/posts/${encodeURIComponent(post.url)}`)
    assert.deepEqual(await page.locator('a.show-more').evaluateAll(links => links.map(link => link.getAttribute('href'))), expected)
    await page.reload()
    assert.deepEqual(await page.locator('a.show-more').evaluateAll(links => links.map(link => link.getAttribute('href'))), expected)
    await pagination.getByRole('link', { name: '上一页' }).click()
    await page.waitForURL(`${site.origin}/`)
  }, { javaScriptEnabled: false })
}
