/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs/promises')
const path = require('path')

const frontmatter = require('frontmatter')
const Rss = require('rss')

const template = require('art-template')

const prism = require('markdown-it-prism')
const math = require('markdown-it-texmath')
const anchor = require('markdown-it-anchor')
const md = require('markdown-it')({
  html: true,
})
  .use(prism)
  .use(math)
  .use(anchor)
const md_pure = require('markdown-it')()

const publicImages = path.join('public', 'images')
const publicPosts = path.join('public', 'posts')

async function tryAccess(dir: string) {
  try {
    return await fs.access(dir)
  }
  catch {
    return 'Not found'
  }
}

export default () => ({
  name: 'build-posts',
  async buildStart() {
    await buildPosts()
  },
  async handleHotUpdate(ctx: { file: string; server: any }) {
    if (ctx.file.includes('posts') && !ctx.file.includes('public')) {
      await buildPosts()
      ctx.server.ws.send({
        type: 'custom',
        event: 'posts-build',
      })
    }
  },
  async closeBundle() {
    if ((await tryAccess(publicImages)) !== 'Not found')
      await fs.rm(publicImages, { recursive: true })

    if ((await tryAccess(publicPosts)) !== 'Not found')
      await fs.rm(publicPosts, { recursive: true })
  },
})

async function buildPosts() {
  const feed = new Rss({
    title: 'liuly\'s Blog',
    description: 'liuly 的个人 Blog',
    feed_url: 'https://blog.liuly.moe/feed.xml',
    site_url: 'https://blog.liuly.moe',
    copyright: '2021 Liuly',
    language: 'zh-cn',
  })

  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/T/g, ' ')
      .replace(/\.[\d]{3}Z/, '')
  }

  if ((await tryAccess(publicImages)) === 'Not found')
    await fs.mkdir(publicImages)

  if ((await tryAccess(publicPosts)) === 'Not found')
    await fs.mkdir(publicPosts)

  const posts = []

  const files = await fs.readdir('posts')
  for (const file of files) {
    if (file.endsWith('.md')) {
      const blogName = path.basename(file, '.md')
      const blogPath = path.join('posts', file)
      const content = await fs.readFile(blogPath, { encoding: 'utf-8' })
      const parsed = frontmatter(content)
      // 准备生成每一博客的 htm, page.json, summary.json
      posts.push({
        title: parsed.data.title,
        date: parsed.data.date,
        tags: parsed.data.tags,
        url: blogName,
        content: parsed.content,
      })
    }
    else if (!path.extname(file)) {
      // 移动 images
      const dirname = path.join('posts', file)
      const images = await fs.readdir(dirname)
      for (const image of images) {
        const src = path.join(dirname, image)
        const dst = path.join(publicImages, image)
        await fs.copyFile(src, dst)
      }
    }
  }

  posts.sort((a, b) => b.date.valueOf() - a.date.valueOf())
  posts.forEach((post) => {
    post.date = formatDate(post.date)
  })

  // 生成 page.json
  const truncate = (s: string, len: number) => {
    const index = s.indexOf('<!-- more -->')
    if (index !== -1)
      return s.slice(0, index)
    else
      return s.length > len ? s.slice(0, len) : s
  }
  const pages = posts.map(post => md.render(truncate(post.content, 100)))
  await fs.writeFile(path.join('public', 'page.json'), JSON.stringify(pages))

  // 生成每篇文章的 htm
  for (const post of posts) {
    const rendered = md.render(post.content)
    await fs.writeFile(path.join(publicPosts, `${post.url}.htm`), rendered)
  }

  // 生成 feed.xml 和每篇文章的 index.html (SSG)
  const htmlTemplate = await fs.readFile(path.join('public', '404.html'), {
    encoding: 'utf-8',
  })
  for (const post of posts) {
    feed.item({
      title: post.title,
      url: `https://blog.liuly.moe/posts/${post.url}`,
      description: md_pure.render(truncate(post.content, 100)),
      date: post.date,
    })
    const html = template.render(htmlTemplate, {
      title: post.title,
      description: post.content
        .replace(/[#*~`><!-]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 160),
      textPath: `/posts/${post.url}.htm`,
      tags: post.tags,
    })
    await fs.writeFile(path.join('public', 'posts', `${post.url}.html`), html)
  }
  const xml = feed.xml()
  await fs.writeFile(path.join('public', 'feed.xml'), xml)

  // 生成 summary.json
  for (const post of posts)
    delete post.content

  await fs.writeFile(path.join('public', 'summary.json'), JSON.stringify(posts))
}
