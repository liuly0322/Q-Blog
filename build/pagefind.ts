/* eslint-disable antfu/no-top-level-await */
import type { Node } from 'node-html-parser'
import fs from 'node:fs/promises'
import path from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import { HTMLElement, NodeType, parse } from 'node-html-parser'
import * as pagefind from 'pagefind'

const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
const han = /\p{Script=Han}/u
const fragmentHeader = 'pagefind_dcd'

// Align index boundaries with browser queries: Pagefind/pagefind#1237.
function segmentText(node: Node) {
  if (node.nodeType === NodeType.TEXT_NODE) {
    const text = node.textContent
    if (han.test(text)) {
      const words = Array.from(segmenter.segment(text), ({ segment }) => segment)
      node.textContent = words.map((word, i) => {
        const previous = words[i - 1]
        const boundary = previous && !/\s$/.test(previous) && !/^\s/.test(word)
          && (han.test(previous) || han.test(word))
        return boundary ? `\u200B${word}` : word
      }).join('')
    }
    return
  }
  if (node instanceof HTMLElement && (node.hasAttribute('data-pagefind-ignore') || ['SCRIPT', 'STYLE'].includes(node.tagName)))
    return
  node.childNodes.forEach(segmentText)
}

function checkErrors({ errors }: { errors: string[] }) {
  if (errors.length)
    throw new Error(errors.join('\n'))
}

try {
  const created = await pagefind.createIndex()
  checkErrors(created)
  const { index } = created
  if (!index)
    throw new Error('Pagefind failed to create an index')
  for (const file of await fs.readdir('dist/posts')) {
    if (!file.endsWith('.html'))
      continue
    const html = parse(await fs.readFile(path.join('dist/posts', file), 'utf8'), {
      parseNoneClosedTags: true,
      blockTextElements: { script: true, style: true, noscript: true },
    })
    const bodies = html.querySelectorAll('[data-pagefind-body]')
    if (!bodies.length)
      throw new Error(`Missing Pagefind body in ${file}`)
    bodies.forEach(segmentText)
    checkErrors(await index.addHTMLFile({
      url: `/posts/${encodeURIComponent(file)}`,
      content: html.toString(),
    }))
  }
  const output = await index.getFiles()
  checkErrors(output)
  await fs.rm('dist/pagefind', { recursive: true, force: true })
  for (const file of output.files) {
    let content = file.content
    if (file.path.endsWith('.pf_fragment')) {
      const data = gunzipSync(content)
      if (data.subarray(0, fragmentHeader.length).toString() !== fragmentHeader)
        throw new Error('Unexpected Pagefind fragment format')
      const fragment = JSON.parse(data.subarray(fragmentHeader.length).toString())
      // Boundaries belong in indexed content, not displayed titles or headings.
      for (const key of Object.keys(fragment.meta))
        fragment.meta[key] = fragment.meta[key].replaceAll('\u200B', '')
      for (const anchor of fragment.anchors)
        anchor.text = anchor.text.replaceAll('\u200B', '')
      content = gzipSync(fragmentHeader + JSON.stringify(fragment))
    }
    const destination = path.join('dist/pagefind', file.path)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.writeFile(destination, content)
  }
}
finally {
  await pagefind.close()
}
