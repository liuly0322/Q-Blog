const fs = require('fs/promises')
const path = require('path')

const frontmatter = require('frontmatter')
const Rss = require('rss')
const feed = new Rss({
  title: "liuly's Blog",
  description: 'liuly 的个人 Blog',
  feed_url: 'https://blog.liuly.moe/feed.xml',
  site_url: 'https://blog.liuly.moe',
  copyright: '2021 Liuly',
  language: 'zh-cn',
})
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

const formatDate = (date) => {
  return date
    .toISOString()
    .replace(/T/g, ' ')
    .replace(/\.[\d]{3}Z/, '')
}

;(async () => {
  try {
    await fs.rm(publicImages, { recursive: true, force: true })
    await fs.mkdir(publicImages)
    await fs.rm(publicPosts, { recursive: true, force: true })
    await fs.mkdir(publicPosts)
  } catch {}

  const posts = []

  const files = await fs.readdir('posts')
  for (const file of files) {
    if (file.endsWith('.md')) {
      const blogName = path.basename(file, '.md')
      const blogPath = path.join('posts', file)
      const content = await fs.readFile(blogPath, { encoding: 'utf-8' })
      const parsed = frontmatter(content)
      // 准备生成每一博客的 json, page.json, summary.json
      posts.push({
        title: parsed.data.title,
        date: parsed.data.date,
        tags: parsed.data.tags,
        url: blogName,
        content: parsed.content,
      })
    } else if (!path.extname(file)) {
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
  /**
   * 截断字符串，优先使用 <!-- more --> 标识
   * @param {string} s 原字符串
   * @param {number} len 截断长度
   * @returns {string} 截断后的字符串
   */
  const truncate = (s, len) => {
    const index = s.indexOf('<!-- more -->')
    if (index != -1) {
      return s.slice(0, index)
    } else {
      return s.length > len ? s.slice(0, len) : s
    }
  }
  const pages = posts.map((post) => md.render(truncate(post.content, 100)))
  fs.writeFile(path.join('public', 'page.json'), JSON.stringify(pages))

  // 生成每篇文章的 json
  for (const post of posts) {
    const rendered = md.render(post.content)
    fs.writeFile(
      path.join(publicPosts, post.url + '.json'),
      JSON.stringify(rendered)
    )
  }

  // 生成 feed.xml 和每篇文章的 index.html (SSG)
  const htmlTemplate = await fs.readFile(path.join('public', '404.html'), {
    encoding: 'utf-8',
  })
  for (const post of posts) {
    feed.item({
      title: post.title,
      url: 'https://blog.liuly.moe/posts/' + post.url,
      description: md_pure.render(truncate(post.content, 100)),
      date: post.date,
    })
    const html = template.render(htmlTemplate, {
      title: post.title,
      description: post.content
        .replace(/[#\*~`><!-]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 160),
      jsonPath: '/posts/' + post.url + '.json',
      tags: post.tags,
    })
    fs.writeFile(path.join('public', 'posts', post.url + '.html'), html)
  }
  const xml = feed.xml()
  fs.writeFile(path.join('public', 'feed.xml'), xml)

  // 生成 summary.json
  for (const post of posts) {
    delete post.content
  }
  fs.writeFile(path.join('public', 'summary.json'), JSON.stringify(posts))
})()
