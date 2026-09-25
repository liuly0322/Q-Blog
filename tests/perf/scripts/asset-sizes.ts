import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const [directory, outputFile] = process.argv.slice(2)
assert(directory, 'Usage: node tests/perf/scripts/asset-sizes.ts DIST_DIR [OUTPUT_JSON]')

const root = path.resolve(directory)
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8')
const jsPath = html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/)?.[1]
const cssPaths = [...html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="([^"]+\.css)")[^>]*>/g)].map(match => match[1])
const cssPath = cssPaths.find(asset => asset.startsWith('/assets/'))
assert(jsPath, 'Could not find the entry JavaScript in index.html')

async function measure(assetPath) {
  const data = await fs.readFile(path.join(root, assetPath.replace(/^\//, '')))
  return { path: assetPath, rawBytes: data.length, gzipBytes: gzipSync(data).length }
}

// The entry stylesheet may be linked or inlined; either way it reaches the browser.
async function measureEntryCss() {
  if (cssPath)
    return { ...(await measure(cssPath)), inlined: false }
  const inline = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('')
  assert(inline, 'Could not find the entry stylesheet in index.html, linked or inlined')
  return { rawBytes: Buffer.byteLength(inline, 'utf8'), gzipBytes: gzipSync(inline).length, inlined: true }
}

const entryJs = await measure(jsPath)
const initialCss = await measureEntryCss()
const result = {
  entryJs,
  initialCss,
  initialJsCss: {
    rawBytes: entryJs.rawBytes + initialCss.rawBytes,
    gzipBytes: entryJs.gzipBytes + initialCss.gzipBytes,
  },
  // Where the inlined sheet's bytes actually land.
  document: {
    rawBytes: Buffer.byteLength(html, 'utf8'),
    gzipBytes: gzipSync(html).length,
  },
}

const serialized = `${JSON.stringify(result, null, 2)}\n`
if (outputFile)
  await fs.writeFile(outputFile, serialized)
else
  process.stdout.write(serialized)
