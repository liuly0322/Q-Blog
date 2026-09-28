/* eslint-disable antfu/no-top-level-await */
import type { BrowserContextOptions, Page, Response } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { launchBrowser, mockExternalServices, startServer } from './browser-utils.ts'

export interface Post {
  url: string
  title: string
  tags: string[]
  date: string
}

const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8')) as { posts: Post[] }
export { posts }

// 内容相关 fixture：文章改名或调整结构时只改这里
export const articleWithToc = { path: '/posts/hello-world', anchor: '#feature', title: 'Hello New World' }
export const scrollArticle = '/posts/sakurada-reset-map'

export interface SitePage {
  origin: string
  page: Page
}

export interface Site extends SitePage {
  // Only explicitly expected HTTP console errors are exempted, by exact URL/status.
  expectHttpError: (url: string, status: number) => void
}

export interface SiteHarness {
  test: (name: string, run: (site: Site) => Promise<void>, options?: BrowserContextOptions) => void
  close: () => Promise<void>
}

export async function createSite(): Promise<SiteHarness> {
  const browser = await launchBrowser()
  const server = await startServer('dist').catch(async (error) => {
    await browser.close()
    throw error
  })
  return {
    test(name, run, options = {}) {
      test(name, { timeout: 60_000 }, async (t) => {
        const context = await browser.newContext({
          serviceWorkers: 'block',
          viewport: { width: 1440, height: 1000 },
          ...options,
        })
        const errors: string[] = []
        const expected = new Map<string, number>()
        let failed = false
        const directory = path.resolve('tests/artifacts', name.replace(/[^\w-]/g, '_'))
        try {
          await mockExternalServices(context)
          const page = await context.newPage()
          page.on('pageerror', error => errors.push(`${page.url()}: ${String(error)}`))
          page.on('console', (message) => {
            if (message.type() !== 'error')
              return
            const url = message.location().url.split('#')[0]
            const status = expected.get(url)
            if (status && message.text().startsWith(`Failed to load resource: the server responded with a status of ${status} (`)) {
              expected.delete(url)
              return
            }
            errors.push(`${url || page.url()}: ${message.text()}`)
          })
          await run({ origin: server.origin, page, expectHttpError: (url, status) => expected.set(url, status) })
        }
        catch (error) {
          failed = true
          throw error
        }
        finally {
          try {
            if (failed || errors.length > 0) {
              await fs.mkdir(directory, { recursive: true })
              await context.pages()[0]?.screenshot({ path: path.join(directory, 'failure.png'), timeout: 5000 }).catch(() => {})
              t.diagnostic(`Failure artifacts: ${directory}`)
              t.diagnostic(JSON.stringify(errors))
            }
          }
          finally {
            await context.close()
          }
          if (!failed)
            assert.deepEqual(errors, [], 'Unexpected browser errors')
        }
      })
    },
    async close() {
      try {
        await browser.close()
      }
      finally { await server.close() }
    },
  }
}

// Compare the rendered body with the independently served build fragment. This
// catches stale/wrong SPA content; source-to-build correctness belongs to SSG tests.
export async function expectArticle(page: Page, articlePath: string) {
  const slug = decodeURIComponent(new URL(articlePath, 'http://localhost').pathname.slice('/posts/'.length))
  const post = posts.find(post => post.url === slug)
  assert(post, `Unknown article: ${articlePath}`)
  await page.locator('[data-post-body]').waitFor({ state: 'visible' })
  const html = await fs.readFile(`dist/posts/${slug}.htm`, 'utf8')
  const text = await page.evaluate((html) => {
    const body = document.createElement('div')
    body.innerHTML = html
    return body.textContent
  }, html)
  await page.waitForFunction(text => document.querySelector('[data-post-body]')?.textContent === text, text, { timeout: 5000 })
  assert.equal(await page.locator('article h1').first().textContent(), post.title)
}

// Small, stable content samples for navigation tests; full-body checks stay in
// the direct-entry and SPA body-loading tests.
const navigationArticles = {
  '/posts/hello-world': '博客搬迁至自建 Vue3 框架',
  '/posts/sakurada-reset-map': '中间层：GeoJSON',
  '/posts/github-actions-ci': '咕了快小半年，今天更新一期关于 GitHub Actions 在项目部署测试中的应用',
  '/posts/senior-year': '大概是一些关于实习、毕业设计、科研和未来生活的碎碎念。',
}

export async function expectArticleSnippet(page: Page, articlePath: keyof typeof navigationArticles) {
  await page.locator('[data-post-body]').getByText(navigationArticles[articlePath], { exact: true }).waitFor({ state: 'visible' })
  const post = posts.find(post => `/posts/${post.url}` === articlePath)!
  assert.equal(await page.locator('article h1').first().textContent(), post.title)
}

export async function expectAnchor(page: Page, selector: string) {
  await page.waitForFunction((selector) => {
    const bounds = document.querySelector(selector)?.getBoundingClientRect()
    return bounds && bounds.top >= -1 && bounds.top <= 100 && bounds.bottom <= innerHeight
  }, selector, { timeout: 5000 })
}

export async function openHydratedPage(sitePage: SitePage, path: string, selector?: string) {
  const response = await sitePage.page.goto(`${sitePage.origin}${path}`)
  assert.equal(response.status(), 200, `${path} should be served`)
  await sitePage.page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  if (selector)
    await sitePage.page.locator(selector).first().waitFor({ state: 'visible' })
  return response
}

export async function clickNav(sitePage: SitePage, selector: string, path: string) {
  await sitePage.page.locator(selector).first().click()
  await sitePage.page.waitForURL(url => new URL(url).pathname === path)
}

// useTitle 的 watch 是 pre-flush，等到之后还要再读一次才能拿到可读的 diff
export async function expectTitle(page: Page, expected: string) {
  try {
    await page.waitForFunction(title => document.title === title, expected, { timeout: 5000 })
  }
  catch {
    // 落到下面的断言，报出实际值
  }
  assert.equal(await page.title(), expected)
}

export async function ssgTitle(response: Response, page: Page) {
  const html = await response.text()
  const title = html.match(/<title>[^<]*<\/title>/)?.[0]
  assert(title, 'Response must contain a static title')
  return page.evaluate(markup => new DOMParser().parseFromString(markup, 'text/html').title, title)
}
