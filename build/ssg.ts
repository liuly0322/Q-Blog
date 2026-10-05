/* eslint-disable antfu/no-top-level-await */
import type { PostSummary } from '../src/composables/useSummary'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import frontmatter from 'frontmatter'
import { build } from 'vite'
import { SITE_TITLE, staticPageDetails, staticPageTitles } from '../src/pageMeta.ts'

type SsrManifest = Record<string, string[]>
type RenderEntry = typeof import('../src/entry-server').render

const siteUrl = 'https://blog.liuly.moe'
const outputDir = path.resolve('dist')
const inlineStyles = process.env.SSG_INLINE_CSS !== '0'
const serverDir = path.resolve('node_modules/.cache/q-blog-ssg')
const staticPages = Object.entries(staticPageTitles).map(([url, title]) => ({
  url,
  title,
  ...staticPageDetails[url],
}))

const spaFallbackScript = `<script type="text/javascript">
  // Single Page Apps for GitHub Pages
  // MIT License
  // https://github.com/rafgraph/spa-github-pages
  (function (l) {
    if (l.search[1] === '/') {
      const decoded = l.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?')
      const basePath = l.pathname.slice(0, l.pathname.lastIndexOf('/') + 1)
      const route = decoded[0] === '/' ? decoded.slice(1) : decoded
      window.history.replaceState(null, null, basePath + route + l.hash)
    }
  }(window.location))
</script>`

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, char => htmlEscapes[char])
}

function generateDescription(content: string, maxLength = 160): string {
  return content
    .replace(/[#*~`><!-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
}

// Inlining trades a request for bytes on the document; past this size the trade reverses.
const inlineStyleBudget = 20 * 1024

// Route sheets as links, entry sheet inlined when the page can carry it.
async function assemblePage(skeleton: string, metadata: string, modules: string[], manifest: SsrManifest): Promise<string> {
  // modules yields route sheets only: the entry sheet is never in the manifest.
  const routes = [...new Set(modules.flatMap(id => manifest[id] ?? []))]
    .filter(asset => asset.endsWith('.css'))
    .map(asset => `<link rel="stylesheet" href="${escapeHtml(asset)}">`)
    .join('\n')
  const entry = skeleton.match(/<link[^>]+rel="stylesheet"[^>]+href="(\/assets\/[^"]+\.css)"[^>]*>/)
  if (!inlineStyles || !entry || gzipSync(skeleton).length > inlineStyleBudget)
    return skeleton.replace('</head>', () => `${metadata}\n${routes}\n</head>`)
  const sheet = await fs.readFile(path.join(outputDir, entry[1].replace(/^\//, '')), 'utf8')
  return skeleton.replace(entry[0], '').replace('</head>', () => `${metadata}\n<style>${sheet}</style>\n${routes}\n</head>`)
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
  const { render } = await import(pathToFileURL(path.join(serverDir, 'entry-server.js')).href) as { render: RenderEntry }
  const template = await fs.readFile(path.join(outputDir, 'index.html'), 'utf8')
  const manifest = JSON.parse(await fs.readFile(path.join(outputDir, '.vite/ssr-manifest.json'), 'utf8')) as SsrManifest
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8')) as { posts: PostSummary[] }
  const tagPages = [...new Set(posts.flatMap(post => post.tags))].map((tag) => {
    return {
      url: `/tags/${tag}`,
      file: `tags/${tag}.html`,
      title: `${tag} | ${SITE_TITLE}`,
      description: `标签「${tag}」下的全部文章。`,
    }
  })
  const started = performance.now()
  if (!template.includes('<div id="app"></div>'))
    throw new Error('Missing app placeholder in the client HTML')

  const spaHtml = template.replace('</head>', `${spaFallbackScript}\n</head>`)
  await fs.writeFile(path.join(outputDir, 'spa.html'), spaHtml)

  for (const pageInfo of [...staticPages, ...tagPages]) {
    const { html, modules } = await render(pageInfo.url)
    const canonical = `${siteUrl}${pageInfo.url}`
    const metadata = [
      `<link rel="canonical" href="${escapeHtml(canonical)}">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:title" content="${escapeHtml(pageInfo.title)}">`,
      `<meta property="og:description" content="${escapeHtml(pageInfo.description)}">`,
      `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    ].join('\n')
    const page = await assemblePage(
      template
        .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(pageInfo.title)}</title>`)
        .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escapeHtml(pageInfo.description)}">`)
        .replace('<div id="app"></div>', () => `<div id="app" data-ssg="true">${html}</div>`),
      metadata,
      modules,
      manifest,
    )
    const outputPath = path.join(outputDir, pageInfo.file)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, page)
  }

  for (const post of posts) {
    const url = `/posts/${encodeURIComponent(post.url)}`
    // Metadata stays in HTML, rather than adding every description to the client JS.
    const markdown = frontmatter(await fs.readFile(path.join('posts', `${post.url}.md`), 'utf8')).content
    const description = generateDescription(markdown)
    const content = await fs.readFile(path.join(outputDir, 'posts', `${post.url}.htm`), 'utf8')
    const { html, modules } = await render(url, { post: post.url, content })
    const title = `${post.title} | ${SITE_TITLE}`
    const metadata = [
      `<link rel="canonical" href="${siteUrl}${url}">`,
      '<meta property="og:type" content="article">',
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
      `<meta property="og:url" content="${siteUrl}${url}">`,
      '<meta property="article:author" content="liuly">',
      ...post.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`),
    ].join('\n')
    const page = await assemblePage(
      template
        .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(title)}</title>`)
        .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escapeHtml(description)}">`)
        .replace('<div id="app"></div>', () => `<div id="app" data-post="${escapeHtml(post.url)}" data-ssg="true">${html}</div>`),
      metadata,
      modules,
      manifest,
    )
    if (!page.includes('data-post-body'))
      throw new Error(`Missing rendered article: ${post.url}`)
    await fs.writeFile(path.join(outputDir, 'posts', `${post.url}.html`), page)
  }
  console.warn(`SSG: generated ${staticPages.length} static pages, ${tagPages.length} tag pages, and ${posts.length} article pages in ${Math.round(performance.now() - started)} ms.`)
}
finally {
  await fs.rm(serverDir, { recursive: true, force: true })
}
