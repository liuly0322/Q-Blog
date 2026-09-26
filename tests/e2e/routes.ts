import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { openHydratedPage, posts } from '../helpers/site.ts'
import type { Site } from '../helpers/site.ts'
import type { Request } from 'playwright'

const staticRoutes: [string, string][] = [
  ['/', '.show-more'],
  ['/about', '.md-blog'],
  ['/archive', '.archive-year-group'],
  ['/links', 'a[href^="https://"]'],
  ['/tags', 'a[href^="/tags/"]'],
  ['/bangumi', 'h1'],
]

export function registerRoutes(site: Site) {
  for (const [path, selector] of staticRoutes) {
    test(`static route ${path} hydrates from its SSG output`, async () => {
      await openHydratedPage(site, path, selector)
    })
  }

  test('every article hydrates from its own SSG output', async (t) => {
    for (const post of posts) {
      await t.test(post.url, async () => {
        const requests: string[] = []
        const onRequest = (request: Request) => requests.push(request.url())
        site.page.on('request', onRequest)
        try {
          // 必须整页直入：SPA 跳转会让正文走 .htm 请求，这里就查不出 SSG 内联失效
          await openHydratedPage(site, `/posts/${encodeURIComponent(post.url)}`, '[data-post-body]')
          assert.equal(await site.page.locator('article h1').first().textContent(), post.title)
          assert(!requests.some(url => /\.htm$|\/page\.json|\/\?\//.test(url)), `Unexpected request for ${post.url}`)
        }
        finally {
          site.page.removeListener('request', onRequest)
        }
      })
    }
  })
}
