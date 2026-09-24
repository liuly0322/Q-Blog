/* eslint-disable antfu/no-top-level-await */
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import frontmatter from 'frontmatter'
import { build } from 'vite'

const siteUrl = 'https://blog.liuly.moe'
const outputDir = path.resolve('dist')
const serverDir = path.resolve('node_modules/.cache/q-blog-ssg')
const staticPages = [
  { url: '/', file: 'index.html', title: 'llyのblog', description: '我的个人博客，写点想写的' },
  { url: '/about', file: 'about.html', title: '关于 | llyのblog', description: 'lly 的经历、兴趣与联系方式。' },
  { url: '/archive', file: 'archive.html', title: '归档 | llyのblog', description: 'llyのblog 的全部文章。' },
  { url: '/links', file: 'links.html', title: '友情链接 | llyのblog', description: 'llyのblog 的友情链接。' },
  { url: '/tags', file: 'tags.html', title: '标签 | llyのblog', description: 'llyのblog 的文章标签。' },
  { url: '/bangumi', file: 'bangumi.html', title: '动画列表 | llyのblog', description: '我在 Bangumi 上看过的动画及短评。' },
]

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

function getAssetLinks(template, modules, manifest) {
  const assets = new Set(modules.flatMap(id => manifest[id] ?? []))
  return [...assets]
    // Route JS is precached and served by the PWA service worker.
    .filter(asset => asset.endsWith('.css') && !template.includes(`"${asset}"`))
    .map(asset => `<link rel="stylesheet" href="${escapeHtml(asset)}">`)
    .join('\n')
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
  const template = await fs.readFile(path.join(outputDir, 'index.html'), 'utf8')
  const manifest = JSON.parse(await fs.readFile(path.join(outputDir, '.vite/ssr-manifest.json'), 'utf8'))
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
  const tagPages = [...new Set(posts.flatMap(post => post.tags))].map((tag) => {
    return {
      url: `/tags/${tag}`,
      file: `tags/${tag}.html`,
      title: `${tag} | llyのblog`,
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
    const assets = getAssetLinks(template, modules, manifest)
    const canonical = `${siteUrl}${pageInfo.url}`
    const metadata = [
      `<link rel="canonical" href="${escapeHtml(canonical)}">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:title" content="${escapeHtml(pageInfo.title)}">`,
      `<meta property="og:description" content="${escapeHtml(pageInfo.description)}">`,
      `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    ].join('\n')
    const page = template
      .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(pageInfo.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escapeHtml(pageInfo.description)}">`)
      .replace('</head>', () => `${metadata}\n${assets}\n</head>`)
      .replace('<div id="app"></div>', () => `<div id="app" data-ssg="true">${html}</div>`)
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
    const links = getAssetLinks(template, modules, manifest)
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
      .replace('<div id="app"></div>', () => `<div id="app" data-post="${escapeHtml(post.url)}" data-ssg="true">${html}</div>`)
    if (!page.includes('data-post-body'))
      throw new Error(`Missing rendered article: ${post.url}`)
    await fs.writeFile(path.join(outputDir, 'posts', `${post.url}.html`), page)
  }
  console.warn(`SSG: generated ${staticPages.length} static pages, ${tagPages.length} tag pages, and ${posts.length} article pages in ${Math.round(performance.now() - started)} ms.`)
}
finally {
  await fs.rm(serverDir, { recursive: true, force: true })
}
