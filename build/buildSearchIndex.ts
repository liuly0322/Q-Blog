import type { Node } from 'node-html-parser'
import type { PagefindIndex } from 'pagefind'
import fs from 'node:fs/promises'
import path from 'node:path'
import { HTMLElement, NodeType, parse } from 'node-html-parser'
import * as pagefind from 'pagefind'

const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
const han = /\p{Script=Han}/u

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

async function indexHtmlFile(index: PagefindIndex, file: string) {
  const html = parse(await fs.readFile(path.join('dist/posts', file), 'utf8'), {
    blockTextElements: { script: true, noscript: true, style: true, pre: false },
  })
  const bodies = html.querySelectorAll('[data-pagefind-body]')
  if (!bodies.length)
    throw new Error(`Missing Pagefind body in ${file}`)
  bodies.forEach(segmentText)
  const { errors } = await index.addHTMLFile({
    url: `/posts/${encodeURIComponent(file)}`,
    content: html.toString(),
  })
  if (errors.length)
    throw new Error(`Pagefind failed to add ${file}: ${errors.join('\n')}`)
}

export default async function buildSearchIndex() {
  const { errors, index } = await pagefind.createIndex()
  if (!index || errors.length)
    throw new Error('Pagefind failed to create an index')

  for (const file of (await fs.readdir('dist/posts')).filter(file => file.endsWith('.html')))
    await indexHtmlFile(index, file)

  await fs.rm('dist/pagefind', { recursive: true, force: true })
  const { errors: writeErrors } = await index.writeFiles({ outputPath: 'dist/pagefind' })
  if (writeErrors.length)
    throw new Error(`Pagefind failed to write files: ${writeErrors.join('\n')}`)
}
