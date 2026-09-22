/* eslint-disable antfu/no-top-level-await */
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import frontmatter from 'frontmatter'
import { build } from 'vite'

const siteUrl = 'https://blog.liuly.moe'
const outputDir = path.resolve('dist')
const serverDir = path.resolve('node_modules/.cache/q-blog-ssg')

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  })[char])
}

function generateDescription(content, maxLength = 160) {
  return content
    .replace(/[#*~`><!-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
}

// public/404.html bounces unknown paths to `/?/<path>`, and index.html restores them on load.
// Article pages are real files reached without a query string, so that restore never runs there.
function stripSpaFallback(html) {
  const stripped = html.replace(/[ \t]*<script\b[^>]*>\s*\/\/ Single Page Apps for GitHub Pages[\s\S]*?<\/script>\n?/, '')
  if (stripped === html)
    throw new Error('SPA fallback script not found in the client HTML; check index.html and public/404.html')
  return stripped
}

// Vite 5's existing SSR build API; no new framework or runtime dependency.
await build({ build: { ssrManifest: true } })

try {
  await build({
    build: {
      ssr: 'src/entry-server.ts',
      outDir: serverDir,
      emptyOutDir: true,
      copyPublicDir: false,
      minify: false,
    },
  })
  const { render } = await import(pathToFileURL(path.join(serverDir, 'entry-server.js')).href)
  const template = stripSpaFallback(await fs.readFile(path.join(outputDir, 'index.html'), 'utf8'))
  const manifest = JSON.parse(await fs.readFile(path.join(outputDir, '.vite/ssr-manifest.json'), 'utf8'))
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
  const started = performance.now()
  if (!template.includes('<div id="app"></div>'))
    throw new Error('Missing app placeholder in the client HTML')

  for (const post of posts) {
    const url = `/posts/${encodeURIComponent(post.url)}`
    // Metadata stays in HTML, rather than adding every description to the client JS.
    const markdown = frontmatter(await fs.readFile(path.join('posts', `${post.url}.md`), 'utf8')).content
    const description = generateDescription(markdown)
    const content = await fs.readFile(path.join(outputDir, 'posts', `${post.url}.htm`), 'utf8')
    const { html, modules } = await render(url, { post: post.url, content })
    const assets = new Set(modules.flatMap(id => manifest[id] ?? []))
    const links = [...assets]
      .filter(asset => !template.includes(`"${asset}"`))
      .map(asset => asset.endsWith('.css')
        ? `<link rel="stylesheet" href="${escapeHtml(asset)}">`
        : asset.endsWith('.js')
          ? `<link rel="modulepreload" crossorigin href="${escapeHtml(asset)}">`
          : '')
      .join('\n')
    const title = `${post.title} | llyのblog`
    const metadata = [
      `<link rel="canonical" href="${siteUrl}${url}">`,
      '<meta property="og:type" content="article">',
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
      `<meta property="og:url" content="${siteUrl}${url}">`,
      '<meta property="article:author" content="liuly">',
      ...post.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`),
    ].join('\n')
    const page = template
      .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escapeHtml(description)}">`)
      .replace('</head>', () => `${metadata}\n${links}\n</head>`)
      .replace('<div id="app"></div>', () => `<div id="app" data-post="${escapeHtml(post.url)}">${html}</div>`)
    if (!page.includes('data-post-body'))
      throw new Error(`Missing rendered article: ${post.url}`)
    await fs.writeFile(path.join(outputDir, 'posts', `${post.url}.html`), page)
  }
  console.warn(`SSG: generated ${posts.length} article pages in ${Math.round(performance.now() - started)} ms.`)
}
finally {
  await fs.rm(serverDir, { recursive: true, force: true })
}
