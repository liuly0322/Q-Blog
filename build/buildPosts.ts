/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs/promises'
import path from 'path'
import { env } from '../presets/shared/env'
import mdImageSizePlugin from './mdImageSizePlugin'

const site_url = env.VITE_SITE_URL

const frontmatter = require('frontmatter')
const Rss = require('rss')

const template = require('art-template')

const descriptionRenderer = require('markdown-it')()
  .use(mdImageSizePlugin(site_url))

const mdPrismPlugin = require('markdown-it-prism')
const mdMathPlugin = require('markdown-it-texmath')
const mdAnchorPlugin = require('markdown-it-anchor')
const postRenderer = require('markdown-it')({ html: true })
  .use(mdPrismPlugin)
  .use(mdMathPlugin)
  .use(mdAnchorPlugin)
  .use(mdImageSizePlugin())

const publicImages = path.join('public', 'images')
const publicPosts = path.join('public', 'posts')

async function fileExists(dir: string) {
  return fs.access(dir).then(() => true).catch(() => false)
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
    if (await fileExists(publicImages))
      await fs.rm(publicImages, { recursive: true })
    if (await fileExists(publicPosts))
      await fs.rm(publicPosts, { recursive: true })
  },
})

const formatDate = (date: Date) => {
  return date
    .toISOString()
    .replace(/T/g, ' ')
    .replace(/\.[\d]{3}Z/, '')
}

async function buildPosts() {
  const feed = new Rss({
    title: 'liuly\'s Blog',
    description: 'liuly 的个人 Blog',
    site_url,
    feed_url: `${site_url}/feed.xml`,
    copyright: '2023 liuly',
    language: 'zh-cn',
  })

  if (!await fileExists(publicImages))
    await fs.mkdir(publicImages)
  if (!await fileExists(publicPosts))
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
  const pages = posts.map(post => postRenderer.render(truncate(post.content, 100)))
  await fs.writeFile(path.join('public', 'page.json'), JSON.stringify(pages))

  // 生成每篇文章的 htm
  for (const post of posts) {
    const rendered = postRenderer.render(post.content)
    await fs.writeFile(path.join(publicPosts, `${post.url}.htm`), rendered)
  }

  // 生成 feed.xml 和每篇文章的 index.html (SSG)
  const htmlTemplate = await fs.readFile(path.join('public', '404.html'), {
    encoding: 'utf-8',
  })
  for (const post of posts) {
    feed.item({
      title: post.title,
      url: `${site_url}/posts/${post.url}`,
      description: descriptionRenderer.render(truncate(post.content, 100)),
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