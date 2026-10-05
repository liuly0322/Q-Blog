import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
// Use Node's built-in runner; this project does not depend on Vitest.
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { gunzipSync } from 'node:zlib'
import { parse } from 'node-html-parser'

const htmlEscapes: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': '\'' }

test('Pagefind indexes each article once with its title and excludes site chrome', async () => {
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
  await fs.access('dist/pagefind/pagefind.js')
  const fragments = await fs.readdir('dist/pagefind/fragment')
  assert.equal(fragments.length, posts.length)
  const urls = new Set<string>()
  for (const file of fragments) {
    const raw = gunzipSync(await fs.readFile(path.join('dist/pagefind/fragment', file))).toString()
    assert(raw.startsWith('pagefind_dcd'))
    const fragment = JSON.parse(raw.slice('pagefind_dcd'.length))
    const post = posts.find(post => fragment.url === `/posts/${encodeURIComponent(post.url)}.html`)
    assert(post, `Unexpected search result: ${fragment.url}`)
    assert.equal(fragment.meta.title, post.title)
    const content = fragment.content.replace(/\u200B/g, '')
    for (const ignored of ['愛の形骸', '追う絵 覆う手を', '上一篇：', '下一篇：', '评论加载中...'])
      assert(!content.includes(ignored), `${fragment.url}: indexed ${ignored}`)
    urls.add(fragment.url)
  }
  assert.equal(urls.size, posts.length)
})

function decode(value: string) {
  return value.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlEscapes[entity])
}

function pageTitle(html: string) {
  return decode(html.match(/<title>([^<]*)<\/title>/)![1])
}

function metaContent(html: string, attribute: string) {
  const pattern = attribute === 'description'
    ? /<meta name="description" content="([^"]*)">/
    : new RegExp(`<meta property="${attribute}" content="([^"]*)">`)
  return decode(html.match(pattern)![1])
}

test('every article is a complete static page with working build assets', async () => {
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
  const files = await fs.readdir('dist/posts')
  assert.equal(files.filter(file => file.endsWith('.html')).length, posts.length)
  assert.equal(files.filter(file => file.endsWith('.htm')).length, posts.length)

  for (const post of posts) {
    const html = await fs.readFile(`dist/posts/${post.url}.html`, 'utf8')
    const body = await fs.readFile(`dist/posts/${post.url}.htm`, 'utf8')
    assert.ok(body.length > 0, post.url)
    assert.equal(html.split(body).length, 2, `${post.url}: body must be present exactly once`)
    assert.match(html, /<div id="app" data-post=/)
    assert.match(html, /<article[^>]*>/)
    assert.match(html, /<div[^>]*data-post-body/)
    const article = html.slice(html.indexOf('<article'), html.indexOf('</article>'))
    assert.doesNotMatch(article, /class="[^"]*animate-pulse/, `${post.url}: skeleton rendered into article`)
    assert.ok(html.includes(`href="https://blog.liuly.moe/posts/${encodeURIComponent(post.url)}"`))
    assert.match(html, /<meta property="og:type" content="article">/)
    assert.match(html, /<meta name="description" content="[^"]+">/)
    assert.equal(pageTitle(html), `${post.title} | llyのblog`, `${post.url}: <title>`)
    assert.equal(metaContent(html, 'og:title'), `${post.title} | llyのblog`, `${post.url}: og:title`)
    const head = html.slice(0, html.indexOf('</head>'))
    const assets = [...head.matchAll(/(?:href|src)="(\/assets\/[^"?#]+)"/g)]
    assert.ok(assets.some(([, asset]) => asset.endsWith('.js')), `${post.url}: missing JS`)
    for (const [, asset] of assets)
      await fs.access(path.join('dist', asset))
  }
})

test('site pages include Bangumi and every tag page', async () => {
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
  const staticPages = [
    ['index.html', '/', 'llyのblog', '我的个人博客，写点想写的'],
    ['about.html', '/about', '关于 | llyのblog', 'lly 的经历、兴趣与联系方式。'],
    ['archive.html', '/archive', '归档 | llyのblog', 'llyのblog 的全部文章。'],
    ['links.html', '/links', '友情链接 | llyのblog', 'llyのblog 的友情链接。'],
    ['tags.html', '/tags', '标签 | llyのblog', 'llyのblog 的文章标签。'],
    ['bangumi.html', '/bangumi', '动画列表 | llyのblog', '我在 Bangumi 上看过的动画及短评。'],
  ]
  const tags = [...new Set<string>(posts.flatMap(post => post.tags))]

  for (const [file, url, title, description] of staticPages) {
    const html = await fs.readFile(`dist/${file}`, 'utf8')
    assert.match(html, /<div id="app" data-ssg="true">/)
    assert.match(html, new RegExp(`<link rel="canonical" href="https://blog\\.liuly\\.moe${url}">`))
    assert.equal(pageTitle(html), title, `${file}: <title>`)
    assert.equal(metaContent(html, 'description'), description, `${file}: description`)
    assert.equal(metaContent(html, 'og:title'), title, `${file}: og:title`)
    const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
    const markers: Record<string, RegExp> = {
      'index.html': /class="[^"]*md-blog-home[^"]*"/,
      'about.html': /<h2[^>]*>名字<\/h2>/,
      'archive.html': /<h2[^>]*id="archive-/,
      'links.html': /href="https:\/\//,
      'tags.html': /href="\/tags\//,
      'bangumi.html': /<h1[^>]*>\s*动画列表（/,
    }
    assert.ok(markers[file].test(body), `${file}: missing static content`)
    if (file === 'index.html' || file === 'archive.html') {
      for (const post of file === 'index.html' ? posts.slice(0, 10) : posts)
        assert(body.includes(`href="/posts/${encodeURIComponent(post.url)}"`), `${file}: missing ${post.url}`)
    }
  }

  for (const tag of tags) {
    const html = await fs.readFile(`dist/tags/${tag}.html`, 'utf8')
    assert.match(html, /<div id="app" data-ssg="true">/)
    assert.ok(html.includes(`<link rel="canonical" href="https://blog.liuly.moe/tags/${tag}">`), tag)
    assert.equal(pageTitle(html), `${tag} | llyのblog`, `${tag}: <title>`)
    const actual = [...html.matchAll(/href="\/posts\/([^"?#]+)"/g)].map(([, slug]) => decodeURIComponent(slug))
    assert.deepEqual(actual, posts.filter(post => post.tags.includes(tag)).map(post => post.url), `${tag}: static article links`)
  }
})

test('every homepage pagination route has its own content, metadata, and real links', async () => {
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8'))
  const pageMax = Math.ceil(posts.length / 10)
  for (let page = 1; page <= pageMax; page++) {
    const url = page === 1 ? '/' : `/${page}`
    const html = await fs.readFile(page === 1 ? 'dist/index.html' : `dist/${page}.html`, 'utf8')
    const root = parse(html)
    const expected = posts.slice((page - 1) * 10, page * 10)
    const links = root.querySelectorAll('a.show-more').map(link => link.getAttribute('href'))
    assert.deepEqual(links, expected.map(post => `/posts/${encodeURIComponent(post.url)}`), url)
    const excerpts = root.querySelectorAll('.md-blog-home')
    const abstracts = JSON.parse(await fs.readFile(`dist/homePages/home-page-${page}.json`, 'utf8')) as string[]
    assert.equal(abstracts.length, expected.length, url)
    assert.deepEqual(excerpts.map(excerpt => excerpt.textContent), abstracts.map(detail => parse(detail).textContent), url)
    assert.equal(excerpts.length, expected.length, url)
    assert(excerpts.every(excerpt => excerpt.textContent.trim().length > 0), url)
    assert.equal(root.querySelector('[data-home-page]')?.getAttribute('data-home-page'), String(page))
    const title = page === 1 ? 'llyのblog' : `第 ${page} 页 | llyのblog`
    assert.equal(pageTitle(html), title)
    assert.equal(metaContent(html, 'og:title'), title)
    assert.equal(root.querySelector('link[rel="canonical"]')?.getAttribute('href'), `https://blog.liuly.moe${url}`)
    const pagination = root.querySelector('nav[aria-label="文章分页"]')!
    const numbered = pagination.querySelectorAll('a').filter(link => /^\d+$/.test(link.textContent.trim()))
    assert.deepEqual(numbered.map(link => link.getAttribute('href')), Array.from({ length: pageMax }, (_, i) => i === 0 ? '/' : `/${i + 1}`))
    assert.equal(pagination.querySelector('a[aria-current="page"]')?.textContent.trim(), String(page))
    assert.equal(pagination.querySelector('[aria-label="上一页"]')?.getAttribute('aria-disabled'), page === 1 ? 'true' : undefined)
    assert.equal(pagination.querySelector('[aria-label="下一页"]')?.getAttribute('aria-disabled'), page === pageMax ? 'true' : undefined)
  }
  await assert.rejects(fs.access('dist/page.json'))
})
