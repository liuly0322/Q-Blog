/* eslint-disable antfu/no-top-level-await */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { launchBrowser, mockExternalServices, startServer } from './browser-utils.ts'
import type { BrowserContextOptions, Page, Response } from 'playwright'

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
  errors: string[]
  newPage: (options?: BrowserContextOptions) => Promise<SitePage & { close: () => Promise<void> }>
  close: () => Promise<void>
}

export function trackErrors(page: Page, errors: string[]) {
  page.on('pageerror', error => errors.push(`${page.url()}: ${String(error)}`))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Service Worker'))
      errors.push(`${page.url()}: ${message.text()}`)
  })
}

export async function createSite(): Promise<Site> {
  const browser = await launchBrowser()
  const server = await startServer('dist')
  const context = await browser.newContext({
    serviceWorkers: 'block',
    viewport: { width: 1440, height: 1000 },
  })
  await mockExternalServices(context)
  const page = await context.newPage()
  const errors: string[] = []
  trackErrors(page, errors)

  return {
    origin: server.origin,
    page,
    errors,
    async newPage(options) {
      const extra = await browser.newContext(options)
      await mockExternalServices(extra)
      const extraPage = await extra.newPage()
      trackErrors(extraPage, errors)
      return {
        origin: server.origin,
        page: extraPage,
        close: () => extra.close(),
      }
    },
    async close() {
      await browser.close()
      await server.close()
    },
  }
}

export async function openHydratedPage(sitePage: SitePage, path: string, selector?: string) {
  const response = await sitePage.page.goto(`${sitePage.origin}${path}`)
  assert.equal(response.status(), 200, `${path} should be served`)
  await sitePage.page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__, undefined, {})
  if (selector)
    await sitePage.page.locator(selector).first().waitFor({ state: 'visible' })
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

export async function ssgTitle(response: Response) {
  const html = await response.text()
  return html.match(/<title>([^<]*)<\/title>/)?.[1]
}
