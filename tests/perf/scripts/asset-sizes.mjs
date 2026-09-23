import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const [directory, outputFile] = process.argv.slice(2)
assert(directory, 'Usage: node tests/perf/scripts/asset-sizes.mjs DIST_DIR [OUTPUT_JSON]')

const root = path.resolve(directory)
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8')
const jsPath = html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"/)?.[1]
const cssPaths = [...html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="([^"]+\.css)")[^>]*>/g)].map(match => match[1])
const cssPath = cssPaths.find(asset => asset.startsWith('/assets/'))
assert(jsPath, 'Could not find the entry JavaScript in index.html')
assert(cssPath, 'Could not find the entry stylesheet in index.html')

async function measure(assetPath) {
  const data = await fs.readFile(path.join(root, assetPath.replace(/^\//, '')))
  return { path: assetPath, rawBytes: data.length, gzipBytes: gzipSync(data).length }
}

const result = {
  entryJs: await measure(jsPath),
  initialCss: await measure(cssPath),
}
result.initialJsCss = {
  rawBytes: result.entryJs.rawBytes + result.initialCss.rawBytes,
  gzipBytes: result.entryJs.gzipBytes + result.initialCss.gzipBytes,
}

const serialized = `${JSON.stringify(result, null, 2)}\n`
if (outputFile)
  await fs.writeFile(outputFile, serialized)
else
  process.stdout.write(serialized)
