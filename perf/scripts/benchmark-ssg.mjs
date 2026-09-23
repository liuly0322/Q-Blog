import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import { launchBrowser, mockExternalServices, startServer } from './ssg-browser-utils.mjs'

assert(process.argv[2], 'Usage: node scripts/benchmark-ssg.mjs BASELINE_DIST [OUTPUT_JSON]')
const runs = Number(process.env.BENCH_RUNS || 3)
const browser = await launchBrowser()
const baseline = await startServer(process.argv[2])
const ssg = await startServer('dist')
const results = []
try {
  for (let run = 0; run < runs; run++) {
    for (const slug of ['hello-world', 'programming-live-webpage', 'formal-languages-and-complexity-notes']) {
      for (const [label, origin] of [['baseline', baseline.origin], ['ssg', ssg.origin]]) {
        const context = await browser.newContext({
          serviceWorkers: 'block',
          viewport: {
            width: 1365,
            height: 900,
          },
        })
        await mockExternalServices(context)
        const page = await context.newPage()
        const cdp = await context.newCDPSession(page)
        await cdp.send('Network.enable')
        await cdp.send('Performance.enable')
        await cdp.send('Network.emulateNetworkConditions', {
          offline: false,
          latency: 150,
          downloadThroughput: 200 * 1024,
          uploadThroughput: 93 * 1024,
          connectionType: 'cellular4g',
        })
        await cdp.send('Emulation.setCPUThrottlingRate', {
          rate: 4,
        })
        const requestMap = new Map()
        const pending = new Set()
        let started
        let documents = 0
        const errors = []
        cdp.on('Network.requestWillBeSent', (r) => {
          if (!r.request.url.startsWith(origin))
            return
          pending.add(r.requestId)
          requestMap.set(r.requestId, {
            url: r.request.url,
            type: r.type,
            bytes: 0,
            startedAt: (r.wallTime || Date.now() / 1000) * 1000,
          })
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
        await context.addInitScript(() => {
          window.bench = {
            fcp: 0,
            lcp: 0,
            cls: 0,
            article: 0,
            hydration: 0,
            origin: performance.timeOrigin,
          }
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (e.name === 'first-contentful-paint')
                window.bench.fcp = e.startTime
            }
          }).observe({
            type: 'paint',
            buffered: true,
          })
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) window.bench.lcp = e.startTime
          }).observe({
            type: 'largest-contentful-paint',
            buffered: true,
          })
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (!e.hadRecentInput)
                window.bench.cls += e.value
            }
          }).observe({
            type: 'layout-shift',
            buffered: true,
          })
          const check = () => {
            const body = document.querySelector('article [data-post-body], article > div > div.md-blog')
            if (body && body.textContent.length && body.getBoundingClientRect().height && getComputedStyle(body.parentElement).display !== 'none')
              window.bench.article = performance.now()
            else
              requestAnimationFrame(check)
          }
          requestAnimationFrame(check)
          const checkHydration = () => {
            if (document.querySelector('#app')?.__vue_app__)
              window.bench.hydration = performance.now()
            else
              requestAnimationFrame(checkHydration)
          }
          requestAnimationFrame(checkHydration)
        })
        await page.goto(`${origin}/posts/${slug}`, {
          waitUntil: 'commit',
        })
        // The old HTML deliberately navigates again; polling survives that navigation.
        for (let i = 0; i < 300; i++) {
          try {
            if (await page.evaluate(() => window.bench?.article > 0))
              break
          }
          catch {}
          await new Promise(r => setTimeout(r, 100))
        }
        await page.waitForTimeout(4000)
        const timings = await page.evaluate(() => window.bench)
        const metrics = await cdp.send('Performance.getMetrics')
        assert(timings.hydration > 0, 'Vue app never hydrated')
        assert.deepEqual(errors, [])
        assert(timings.article > 0, 'Article never became visible')
        assert.equal(pending.size, 0, 'Observation window ended with downloads pending')
        const offset = timings.origin - started
        const requests = [...requestMap.values()]
        const criticalRequests = requests.filter(request => request.startedAt <= timings.origin + timings.hydration)
        const row = {
          run,
          label,
          slug,
          articleMs: Math.round(offset + timings.article),
          hydrationMs: Math.round(offset + timings.hydration),
          fcpMs: Math.round(offset + timings.fcp),
          lcpMs: Math.round(offset + timings.lcp),
          cls: Math.round(timings.cls * 1000) / 1000,
          documents,
          requests: requestMap.size,
          transferBytes: requests.reduce((n, r) => n + r.bytes, 0),
          criticalJsBytes: criticalRequests.filter(r => r.type === 'Script').reduce((n, r) => n + r.bytes, 0),
          criticalCssBytes: criticalRequests.filter(r => r.type === 'Stylesheet').reduce((n, r) => n + r.bytes, 0),
          jsBytes: requests.filter(r => r.type === 'Script').reduce((n, r) => n + r.bytes, 0),
          scriptMs: Math.round(metrics.metrics.find(m => m.name === 'ScriptDuration').value * 1000),
          errors,
        }
        results.push(row)
        console.warn(JSON.stringify(row))
        await fs.writeFile(process.argv[3] || '/tmp/q-blog-ssg-benchmark.json', JSON.stringify(results, null, 2))
        await context.close()
      }
    }
  }
}
finally {
  await browser.close()
  await baseline.close()
  await ssg.close()
}
