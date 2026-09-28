import type { SiteHarness } from '../helpers/site.ts'
import assert from 'node:assert/strict'
import { expectArticle, expectTitle, openHydratedPage, posts, ssgTitle } from '../helpers/site.ts'

// Literal expectations intentionally independent of the application metadata.
const staticRoutes: [string, string, string][] = [
  ['/', '.show-more', 'llyのblog'],
  ['/about', '.md-blog', '关于 | llyのblog'],
  ['/archive', '.archive-year-group', '归档 | llyのblog'],
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

  for (const route of ['/', '/archive', `/tags/${encodeURIComponent(posts[0].tags[0])}`, '/posts/hello-world']) {
    harness.test(`SSG content is usable without JavaScript on ${route}`, async (site) => {
      const response = await site.page.goto(site.origin + route)
      assert.equal(response.status(), 200)
      if (route.startsWith('/posts/')) {
        await expectArticle(site.page, route)
      }
      else {
        const expected = route === '/'
          ? posts.slice(0, 10)
          : route === '/archive'
            ? posts
            : posts.filter(post => post.tags.includes(posts[0].tags[0]))
        const selector = route === '/' ? 'a.show-more' : route === '/archive' ? '.archive-item' : '.grid a[href^="/posts/"]'
        await site.page.locator(selector).first().waitFor({ state: 'visible' })
        const links = await site.page.locator(selector).evaluateAll(elements => elements.map(el => decodeURIComponent(el.getAttribute('href'))))
        assert.deepEqual(links, expected.map(post => `/posts/${post.url}`))
        if (route === '/') {
          await site.page.locator('.md-blog-home').first().waitFor({ state: 'visible' })
          const excerpts = await site.page.locator('.md-blog-home').allTextContents()
          assert.equal(excerpts.length, expected.length)
          assert(excerpts.every(text => text.trim().length > 0))
        }
      }
    }, { javaScriptEnabled: false })
  }
}
