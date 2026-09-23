import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const [homeFile, articlesFile, baselineAssetsFile, currentAssetsFile, outputFile] = process.argv.slice(2)
assert(homeFile && articlesFile, 'Usage: node perf/scripts/report.mjs HOME_JSON ARTICLES_JSON [BASE_ASSETS_JSON CURRENT_ASSETS_JSON [OUTPUT_MD]]')

const [home, articles] = await Promise.all([
  fs.readFile(homeFile, 'utf8').then(JSON.parse),
  fs.readFile(articlesFile, 'utf8').then(JSON.parse),
])
const baseAssets = baselineAssetsFile ? JSON.parse(await fs.readFile(baselineAssetsFile, 'utf8')) : undefined
const currentAssets = currentAssetsFile ? JSON.parse(await fs.readFile(currentAssetsFile, 'utf8')) : undefined

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function value(rows, label, key) {
  const values = rows.filter(row => row.label === label).map(row => row[key]).filter(Number.isFinite)
  return values.length ? median(values) : undefined
}

function format(metric, n) {
  if (n === undefined)
    return 'n/a'
  if (metric === 'cls')
    return n.toFixed(3)
  if (metric.endsWith('Bytes'))
    return `${(n / 1024).toFixed(1)} KiB`
  return `${Math.round(n)} ms`
}

function comparison(rows, key, metric = key) {
  const before = value(rows, 'baseline', key)
  const after = value(rows, 'ssg', key)
  if (before === undefined || after === undefined)
    return 'n/a'
  const delta = after - before
  const sign = delta > 0 ? '+' : ''
  const unit = metric === 'cls' ? '' : metric.endsWith('Bytes') ? ' B' : ' ms'
  const deltaText = metric === 'cls' ? `${sign}${delta.toFixed(3)}` : `${sign}${Math.round(delta)}${unit}`
  return `${format(metric, before)} → ${format(metric, after)} (${deltaText})`
}

const lines = [
  '## Browser performance comparison',
  '',
  'Paired local builds measured in Chromium with 150 ms latency, 200 KiB/s download, 93 KiB/s upload, and 4× CPU throttling. Values are medians of three runs; lower is better except CLS should remain near zero. The transfer window includes resources after hydration.',
  '',
  '| Page | Content visible | Hydration | FCP | LCP | CLS |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
]

lines.push(`| Home | ${comparison(home, 'contentMs')} | ${comparison(home, 'hydrationMs')} | ${comparison(home, 'fcpMs')} | ${comparison(home, 'lcpMs')} | ${comparison(home, 'cls', 'cls')} |`)
for (const slug of [...new Set(articles.map(row => row.slug))]) {
  const rows = articles.filter(row => row.slug === slug)
  lines.push(`| Article: \`${slug}\` | ${comparison(rows, 'articleMs')} | ${comparison(rows, 'hydrationMs')} | ${comparison(rows, 'fcpMs')} | ${comparison(rows, 'lcpMs')} | ${comparison(rows, 'cls', 'cls')} |`)
}

lines.push('', '| Page | JS requested by hydration | CSS requested by hydration | JS total | Script execution | Total transfer |', '| --- | ---: | ---: | ---: | ---: | ---: |')
lines.push(`| Home | ${comparison(home, 'criticalJsBytes')} | ${comparison(home, 'criticalCssBytes')} | ${comparison(home, 'jsBytes')} | ${comparison(home, 'scriptMs')} | ${comparison(home, 'transferBytes')} |`)
for (const slug of [...new Set(articles.map(row => row.slug))]) {
  const rows = articles.filter(row => row.slug === slug)
  lines.push(`| Article: \`${slug}\` | ${comparison(rows, 'criticalJsBytes')} | ${comparison(rows, 'criticalCssBytes')} | ${comparison(rows, 'jsBytes')} | ${comparison(rows, 'scriptMs')} | ${comparison(rows, 'transferBytes')} |`)
}

if (baseAssets && currentAssets) {
  function assetComparison(key) {
    const before = baseAssets[key].gzipBytes
    const after = currentAssets[key].gzipBytes
    const delta = after - before
    const sign = delta > 0 ? '+' : ''
    return `${format('gzipBytes', before)} → ${format('gzipBytes', after)} (${sign}${delta} B)`
  }
  lines.push('', '### Entry asset sizes (gzip)', '', '| Asset | Base → head |', '| --- | ---: |')
  lines.push(`| Entry JS | ${assetComparison('entryJs')} |`)
  lines.push(`| Initial CSS | ${assetComparison('initialCss')} |`)
  lines.push(`| Entry JS + initial CSS | ${assetComparison('initialJsCss')} |`)
}

lines.push('', 'Data artifacts contain the per-run raw measurements. These are controlled browser timings, not field Core Web Vitals. The workflow reports results without failing on a percentage threshold while variance is being established.')
const markdown = `${lines.join('\n')}\n`
if (outputFile)
  await fs.writeFile(outputFile, markdown)
else
  process.stdout.write(markdown)
