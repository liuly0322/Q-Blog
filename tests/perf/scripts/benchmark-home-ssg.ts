import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { launchBrowser, mockExternalServices, startServer } from '../../helpers/browser-utils.ts'

assert(process.argv[2], 'Usage: node benchmark-home-ssg.ts BASELINE_DIST [OUTPUT_JSON] [RUNS]')
const outputFile = process.argv[3] || '/tmp/q-blog-home-ssg/results.json'
const runs = Number(process.argv[4] || 3)
const browser = await launchBrowser()
const baseline = await startServer(process.argv[2])
const ssg = await startServer('dist')
const results = []

try {
  for (let run = 0; run < runs; run++) {
    for (const [label, origin] of [['baseline', baseline.origin], ['ssg', ssg.origin]]) {
      const context = await browser.newContext({
        serviceWorkers: 'block',
        viewport: { width: 1365, height: 900 },
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
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

      const requestMap = new Map()
      const pending = new Set()
      let started
      let documents = 0
      const errors = []
      cdp.on('Network.requestWillBeSent', (request) => {
        if (!request.request.url.startsWith(origin))
          return
        pending.add(request.requestId)
        requestMap.set(request.requestId, {
          url: request.request.url,
          type: request.type,
          bytes: 0,
          startedAt: (request.wallTime || Date.now() / 1000) * 1000,
        })
        if (request.type === 'Document') {
          documents++
          started ??= request.wallTime * 1000
        }
      })
      cdp.on('Network.dataReceived', (response) => {
        const request = requestMap.get(response.requestId)
        if (request)
          request.bytes += response.encodedDataLength
      })
      cdp.on('Network.loadingFinished', (response) => {
        pending.delete(response.requestId)
        const request = requestMap.get(response.requestId)
        if (request)
          request.bytes = response.encodedDataLength
      })
      cdp.on('Network.loadingFailed', response => pending.delete(response.requestId))
      page.on('pageerror', error => errors.push(String(error)))

      await context.addInitScript(() => {
        window.homeBench = {
          fcp: 0,
          lcp: 0,
          cls: 0,
          content: 0,
          contentChars: 0,
          hydration: 0,
          origin: performance.timeOrigin,
        }
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint')
              window.homeBench.fcp = entry.startTime
          }
        }).observe({ type: 'paint', buffered: true })
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            window.homeBench.lcp = entry.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        new PerformanceObserver((list) => {
          for (const rawEntry of list.getEntries()) {
            const entry = rawEntry as LayoutShift
            if (!entry.hadRecentInput)
              window.homeBench.cls += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: true })

        const checkContent = () => {
          const body = document.querySelector('article .md-blog-home')
          if (body && body.textContent.trim() && body.getBoundingClientRect().height
            && getComputedStyle(body.parentElement).display !== 'none') {
            window.homeBench.content = performance.now()
            window.homeBench.contentChars = body.textContent.trim().length
            return
          }
          requestAnimationFrame(checkContent)
        }
        requestAnimationFrame(checkContent)
        const checkHydration = () => {
          if (document.querySelector('#app')?.__vue_app__)
            window.homeBench.hydration = performance.now()
          else
            requestAnimationFrame(checkHydration)
        }
        requestAnimationFrame(checkHydration)
      })

      await page.goto(origin, { waitUntil: 'commit' })
      for (let attempt = 0; attempt < 300; attempt++) {
        try {
          if (await page.evaluate(() => window.homeBench?.content > 0))
            break
        }
        catch {}
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const visible = await page.evaluate(() => window.homeBench)
      assert(visible.content > 0, 'Homepage article excerpt never became visible')

      // Wait for eager homepage images and the SPA's page.json request to settle.
      const quietStarted = Date.now()
      let quietSince
      while (Date.now() - quietStarted < 25000) {
        if (pending.size === 0) {
          quietSince ??= Date.now()
          if (Date.now() - quietSince >= 500)
            break
        }
        else {
          quietSince = undefined
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const timings = await page.evaluate(() => window.homeBench)
      const metrics = await cdp.send('Performance.getMetrics')
      assert(timings.hydration > 0, 'Vue app never hydrated')
      assert.deepEqual(errors, [])
      const offset = timings.origin - started
      const requests = [...requestMap.values()]
      const criticalRequests = requests.filter(request => request.startedAt <= timings.origin + timings.hydration)
      const row = {
        run,
        label,
        contentMs: Math.round(offset + timings.content),
        hydrationMs: Math.round(offset + timings.hydration),
        fcpMs: Math.round(offset + timings.fcp),
        lcpMs: Math.round(offset + timings.lcp),
        cls: Math.round(timings.cls * 1000) / 1000,
        contentChars: timings.contentChars,
        documents,
        requests: requestMap.size,
        documentBytes: requests.filter(request => request.type === 'Document').reduce((sum, request) => sum + request.bytes, 0),
        transferBytes: requests.reduce((sum, request) => sum + request.bytes, 0),
        criticalJsBytes: criticalRequests.filter(request => request.type === 'Script').reduce((sum, request) => sum + request.bytes, 0),
        criticalCssBytes: criticalRequests.filter(request => request.type === 'Stylesheet').reduce((sum, request) => sum + request.bytes, 0),
        jsBytes: requests.filter(request => request.type === 'Script').reduce((sum, request) => sum + request.bytes, 0),
        scriptMs: Math.round(metrics.metrics.find(metric => metric.name === 'ScriptDuration').value * 1000),
        pendingAtEnd: pending.size,
        errors,
      }
      results.push(row)
      console.warn(JSON.stringify(row))
      await fs.mkdir(path.dirname(outputFile), { recursive: true })
      await fs.writeFile(outputFile, JSON.stringify(results, null, 2))
      await context.close()
    }
  }
}
finally {
  await browser.close()
  await baseline.close()
  await ssg.close()
}
