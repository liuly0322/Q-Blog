import type { OutgoingHttpHeaders } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { Browser, BrowserContext, Page, Request } from 'playwright'
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

// Optional test tooling, kept outside the application's dependency graph.
export async function launchBrowser(): Promise<Browser> {
  const {
    chromium,
  } = await import(process.env.Q_BLOG_PLAYWRIGHT || 'playwright')
  return chromium.launch({
    // Avoid headless-shell's modifier-click popup race: microsoft/playwright#42142.
    channel: 'chromium',
    headless: true,
  })
}
export async function startServer(directory: string) {
  const root = path.resolve(directory)
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ico': 'image/x-icon',
  }
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
      const target = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
      if (!target.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end()
        return
      }
      let file
      for (const candidate of [target, `${target}.html`]) {
        if (await fs.stat(candidate).then(stat => stat.isFile()).catch(() => false)) {
          file = candidate
          break
        }
      }
      const status = file ? 200 : 404
      file ??= path.join(root, '404.html')
      let data = await fs.readFile(file)
      const headers: OutgoingHttpHeaders = {
        'content-type': types[path.extname(file)] || 'application/octet-stream',
        'cache-control': 'no-store',
      }
      if (/html|javascript|css|json|svg/.test(String(headers['content-type'])) && /gzip/.test(String(request.headers['accept-encoding'] || ''))) {
        data = gzipSync(data)
        headers['content-encoding'] = 'gzip'
      }
      headers['content-length'] = data.length
      response.writeHead(status, headers).end(data)
    }
    catch {
      response.writeHead(500).end()
    }
  })
  await new Promise<void>(resolve => server.listen({ port: 0, host: '127.0.0.1' }, resolve))
  const address = server.address() as AddressInfo
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  }
}
export async function mockExternalServices(context: BrowserContext) {
  // Keep third-party services out of browser checks.
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1')
      return route.continue()
    return route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: route.request().url().includes('meting-api') ? '[]' : '',
    })
  })
}

// A page CDP session can see a worker's request start without its completion
// event. Playwright tracks requests across that handoff, so use it for idleness.
export function trackPendingRequests(page: Page, origin: string) {
  const pending = new Set<Request>()
  page.on('request', (request) => {
    if (new URL(request.url()).origin === origin)
      pending.add(request)
  })
  page.on('requestfinished', request => pending.delete(request))
  page.on('requestfailed', request => pending.delete(request))
  return pending
}

export async function waitForDownloads(pending: ReadonlySet<Request>) {
  const started = Date.now()
  let quietSince: number | undefined
  while (Date.now() - started < 25_000) {
    if (pending.size === 0) {
      quietSince ??= Date.now()
      if (Date.now() - quietSince >= 500)
        return
    }
    else {
      quietSince = undefined
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Downloads did not settle: ${[...pending].map(request => request.url()).join(', ')}`)
}
