import type { PostSummary } from '../src/composables/useSummary'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import frontmatter from 'frontmatter'
import { build } from 'vite'
import { homePageTitle, SITE_TITLE, SITE_URL, staticPageDetails, staticPageTitles } from '../src/pageMeta.ts'
import { homePageCount, homePagePath } from '../src/utils/homePagination.ts'

type SsrManifest = Record<string, string[]>
type ServerEntry = typeof import('../src/entry-server')

interface PageInfo {
  url: string
  file: string
  title: string
  description: string
  post?: PostSummary
}

interface RenderContext {
  template: string
  manifest: SsrManifest
  render: ServerEntry['render']
}

const outputDir = path.resolve('dist')
const serverDir = path.resolve('node_modules/.cache/q-blog-ssg')
const staticPages = Object.entries(staticPageTitles).map(([url, title]) => ({
  url,
  title,
  ...staticPageDetails[url],
}))

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  })[char]!)
}

async function buildServer(): Promise<ServerEntry> {
  await build({
    build: {
      ssr: 'src/entry-server.ts',
      outDir: serverDir,
      emptyOutDir: true,
      copyPublicDir: false,
      minify: false,
    },
  })
  return await import(pathToFileURL(path.join(serverDir, 'entry-server.js')).href) as ServerEntry
}

async function loadBuildData() {
  const template = await fs.readFile(path.join(outputDir, 'index.html'), 'utf8')
  const manifest = JSON.parse(await fs.readFile(path.join(outputDir, '.vite/ssr-manifest.json'), 'utf8')) as SsrManifest
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8')) as { posts: PostSummary[] }
  return { template, manifest, posts }
}

async function loadServerCache(posts: PostSummary[], server: ServerEntry) {
  const { postCache, postAbstractsCache } = server
  for (const post of posts) {
    postCache.set(post.url, await fs.readFile(path.join(outputDir, 'posts', `${post.url}.htm`), 'utf8'))
  }
  for (let page = 1; page <= homePageCount(posts.length); page++) {
    const abstracts = JSON.parse(await fs.readFile(path.join(outputDir, 'homePages', `home-page-${page}.json`), 'utf8')) as string[]
    postAbstractsCache.set(page, abstracts)
  }
}

function collectPaginationPages(posts: PostSummary[]): PageInfo[] {
  return Array.from({ length: homePageCount(posts.length) - 1 }, (_, i) => ({
    url: homePagePath(i + 2),
    file: `${i + 2}.html`,
    title: homePageTitle(i + 2),
    description: `我的个人博客，写点想写的（第 ${i + 2} 页）`,
  }))
}

function collectTagPages(posts: PostSummary[]): PageInfo[] {
  return [...new Set(posts.flatMap(post => post.tags))].map(tag => ({
    url: `/tags/${tag}`,
    file: `tags/${tag}.html`,
    title: `${tag} | ${SITE_TITLE}`,
    description: `标签「${tag}」下的全部文章。`,
  }))
}

function generateMetadata({ url, title, description, post }: PageInfo) {
  const canonical = escapeHtml(`${SITE_URL}${url}`)
  const metadata = [
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${post ? 'article' : 'website'}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
  ]
  if (post) {
    metadata.push(
      '<meta property="article:author" content="liuly">',
      ...post.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`),
    )
  }
  return metadata.join('\n')
}

async function applyPageStyles(skeleton: string, modules: string[], manifest: SsrManifest): Promise<string> {
  // modules yields route sheets only: the entry sheet is never in the manifest.
  const routeStyleLinks = [...new Set(modules.flatMap(id => manifest[id] ?? []))]
    .filter(asset => asset.endsWith('.css'))
    .map(asset => `<link rel="stylesheet" href="${escapeHtml(asset)}">`)
    .join('\n')
  const entry = skeleton.match(/<link[^>]+rel="stylesheet"[^>]+href="(\/assets\/[^"]+\.css)"[^>]*>/)
  if (process.env.SSG_INLINE_CSS === '0' || !entry)
    return skeleton.replace('</head>', () => `${routeStyleLinks}\n</head>`)
  const sheet = await fs.readFile(path.join(outputDir, entry[1].replace(/^\//, '')), 'utf8')
  return skeleton.replace(entry[0], '').replace('</head>', () => `<style>${sheet}</style>\n${routeStyleLinks}\n</head>`)
}

async function renderPage(pageInfo: PageInfo, { template, manifest, render }: RenderContext) {
  const { html, modules } = await render(pageInfo.url)
  const postAttribute = pageInfo.post ? ` data-post="${escapeHtml(pageInfo.post.url)}"` : ''
  const skeleton = template
    .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(pageInfo.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escapeHtml(pageInfo.description)}">`)
    .replace('<div id="app"></div>', () => `<div id="app"${postAttribute} data-ssg="true">${html}</div>`)
    .replace('</head>', () => `${generateMetadata(pageInfo)}\n</head>`)
  return applyPageStyles(skeleton, modules, manifest)
}

async function writePage(file: string, html: string) {
  const outputPath = path.join(outputDir, file)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, html)
}

async function generateSpaFallback(template: string) {
  const html = template.replace('</head>', `<script type="text/javascript">
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
</script></head>`)
  await writePage('spa.html', html)
}

async function generatePages(pages: PageInfo[], context: RenderContext) {
  for (const pageInfo of pages)
    await writePage(pageInfo.file, await renderPage(pageInfo, context))
}

async function generatePosts(posts: PostSummary[], context: RenderContext) {
  for (const post of posts) {
    const markdown = frontmatter(await fs.readFile(path.join('posts', `${post.url}.md`), 'utf8')).content
    const pageInfo: PageInfo = {
      url: `/posts/${encodeURIComponent(post.url)}`,
      file: `posts/${post.url}.html`,
      title: `${post.title} | ${SITE_TITLE}`,
      description: markdown.replace(/[#*~`><!-]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 160),
      post,
    }
    const html = await renderPage(pageInfo, context)
    if (!html.includes('data-post-body'))
      throw new Error(`Missing rendered article: ${post.url}`)
    await writePage(pageInfo.file, html)
  }
}

export default async function buildStaticSite() {
  // Build the client bundle first.
  await build({ build: { ssrManifest: true } })

  try {
    const server = await buildServer()
    const { template, manifest, posts } = await loadBuildData()
    await loadServerCache(posts, server)

    const paginationPages = collectPaginationPages(posts)
    const tagPages = collectTagPages(posts)
    const context = { template, manifest, render: server.render }
    const started = performance.now()

    await generateSpaFallback(template)
    await generatePages([...staticPages, ...paginationPages, ...tagPages], context)
    await generatePosts(posts, context)
    console.warn(`SSG: generated ${staticPages.length} static pages, ${paginationPages.length} pagination pages, ${tagPages.length} tag pages, and ${posts.length} article pages in ${Math.round(performance.now() - started)} ms.`)
  }
  finally {
    await fs.rm(serverDir, { recursive: true, force: true })
  }
}
