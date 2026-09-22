import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
// Use Node's built-in runner; this project does not depend on Vitest.
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'

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
    const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(([, script]) => script).join('\n')
    assert.doesNotMatch(inlineScripts, /spa-github-pages|history\.replaceState|l\.replace\(|sessionStorage\.setItem\(/)
    assert.doesNotMatch(html, /<div[^>]+class="[^"]*post-skeleton-list/)
    assert.ok(html.includes(`href="https://blog.liuly.moe/posts/${encodeURIComponent(post.url)}"`))
    assert.match(html, /<meta property="og:type" content="article">/)
    assert.match(html, /<meta name="description" content="[^"]+">/)
    const head = html.slice(0, html.indexOf('</head>'))
    const assets = [...head.matchAll(/(?:href|src)="(\/assets\/[^"?#]+)"/g)]
    assert.ok(assets.some(([, asset]) => asset.endsWith('.css')), `${post.url}: missing CSS`)
    assert.ok(assets.some(([, asset]) => asset.endsWith('.js')), `${post.url}: missing JS`)
    for (const [, asset] of assets)
      await fs.access(path.join('dist', asset))
  }
})
