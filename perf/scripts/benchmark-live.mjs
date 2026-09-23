// Compare two live deployments with the same throttled profile as the local
// article benchmark, plus an unthrottled pass.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'

const { chromium } = await import(process.env.Q_BLOG_PLAYWRIGHT || 'playwright')

const baselineUrl = process.env.PERF_BASELINE_URL
const headUrl = process.env.PERF_HEAD_URL
assert(baselineUrl && headUrl, 'Set PERF_BASELINE_URL and PERF_HEAD_URL to the two deployed site URLs')
const ORIGINS = {
  baseline: baselineUrl,
  ssg: headUrl,
}
const HOSTS = new Set(Object.values(ORIGINS).map(u => new URL(u).hostname))
const SLUGS = ['hello-world', 'programming-live-webpage', 'formal-languages-and-complexity-notes']
const OUT = process.argv[2] || '/tmp/q-blog-live-benchmark.json'

const THROTTLE = {
  offline: false,
  latency: 150,
  downloadThroughput: 200 * 1024,
  uploadThroughput: 93 * 1024,
  connectionType: 'cellular4g',
}

const browser = await chromium.launch({ headless: true })
const results = []

async function newPage(throttled) {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    viewport: { width: 1365, height: 900 },
  })
  // Keep third-party services out of the measurement, but let the deployments through.
  await context.route('**/*', (route) => {
    if (HOSTS.has(new URL(route.request().url()).hostname))
      return route.continue()
    return route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: route.request().url().includes('meting-api') ? '[]' : '',
    })
  })
  await context.addInitScript(() => {
    window.bench = { fcp: 0, lcp: 0, cls: 0, article: 0, origin: performance.timeOrigin }
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.name === 'first-contentful-paint')
          window.bench.fcp = e.startTime
      }
    }).observe({ type: 'paint', buffered: true })
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.bench.lcp = e.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput)
          window.bench.cls += e.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    const check = () => {
      const body = document.querySelector('article [data-post-body], article > div > div.md-blog')
      if (body && body.textContent.length && body.getBoundingClientRect().height
        && getComputedStyle(body.parentElement).display !== 'none')
        window.bench.article = performance.now()
      else
        requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Performance.enable')
  if (throttled) {
    await cdp.send('Network.emulateNetworkConditions', THROTTLE)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  }
  return { context, page, cdp }
}

async function load(origin, slug, throttled, warmup = false) {
  const { context, page, cdp } = await newPage(throttled)
  const requestMap = new Map()
  const pending = new Set()
  const errors = []
  let started
  let documents = 0
  cdp.on('Network.requestWillBeSent', (r) => {
    if (!r.request.url.startsWith(origin))
      return
    pending.add(r.requestId)
    requestMap.set(r.requestId, { url: r.request.url, type: r.type, bytes: 0 })
    if (r.type === 'Document') {
      documents++
      started ??= r.wallTime * 1000
    }
  })
  cdp.on('Network.dataReceived', (r) => {
    const request = requestMap.get(r.requestId)
    if (request)
      request.bytes += r.encodedDataLength
  })
  cdp.on('Network.loadingFinished', (r) => {
    pending.delete(r.requestId)
    const q = requestMap.get(r.requestId)
    if (q)
      q.bytes = r.encodedDataLength
  })
  cdp.on('Network.loadingFailed', r => pending.delete(r.requestId))
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto(`${origin}/posts/${slug}`, { waitUntil: 'commit' })
  // The old HTML deliberately navigates again; polling survives that navigation.
  for (let i = 0; i < 300; i++) {
    try {
      if (await page.evaluate(() => window.bench?.article > 0))
        break
    }
    catch {}
    await new Promise(r => setTimeout(r, 100))
  }
  await page.waitForTimeout(warmup ? 3000 : 4000)
  const timings = await page.evaluate(() => window.bench)
  const metrics = await cdp.send('Performance.getMetrics')
  const offset = timings.origin - started
  const row = {
    throttled,
    label: origin === ORIGINS.baseline ? 'baseline' : 'ssg',
    slug,
    articleMs: Math.round(offset + timings.article),
    fcpMs: Math.round(offset + timings.fcp),
    lcpMs: Math.round(offset + timings.lcp),
    cls: Math.round(timings.cls * 1000) / 1000,
    documents,
    requests: requestMap.size,
    transferBytes: [...requestMap.values()].reduce((n, r) => n + r.bytes, 0),
    jsBytes: [...requestMap.values()].filter(r => r.type === 'Script').reduce((n, r) => n + r.bytes, 0),
    scriptMs: Math.round(metrics.metrics.find(m => m.name === 'ScriptDuration').value * 1000),
    pending: pending.size,
    errors,
  }
  await context.close()
  return row
}

try {
  // Warm up both deployments: cold isolates and an empty edge cache would
  // otherwise show up as first-run outliers.
  console.warn('warming up...')
  for (const origin of Object.values(ORIGINS)) {
    for (const slug of SLUGS)
      await load(origin, slug, false, true)
  }

  for (const throttled of [true, false]) {
    const runs = throttled ? 3 : 2
    for (let run = 0; run < runs; run++) {
      for (const slug of SLUGS) {
        for (const origin of Object.values(ORIGINS)) {
          const row = await load(origin, slug, throttled)
          row.run = run
          results.push(row)
          console.warn(JSON.stringify(row))
          await fs.writeFile(OUT, JSON.stringify(results, null, 2))
        }
      }
    }
  }
}
finally {
  await browser.close()
}
console.warn(`\nwrote ${OUT}`)
