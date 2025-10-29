import fs from 'node:fs/promises'
import path from 'node:path'
import Shiki from '@shikijs/markdown-it'
import template from 'art-template'
import frontmatter from 'frontmatter'
import markdownIt from 'markdown-it'
import mdAnchorPlugin from 'markdown-it-anchor'
import mdLinkAttrPlugin from 'markdown-it-link-attributes'
import mdMathPlugin from 'markdown-it-texmath'
import RSS from 'rss'
import mdImageSizePlugin from './mdImageSizePlugin'

const SITE_URL = 'https://blog.liuly.moe'

const descriptionRenderer = markdownIt()
  .use(mdImageSizePlugin(SITE_URL))
const postRenderer = markdownIt({ html: true })
  // eslint-disable-next-line antfu/no-top-level-await
  .use(await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  }))
  .use(mdMathPlugin)
  .use(mdAnchorPlugin)
  .use(mdLinkAttrPlugin, {
    attrs: {
      target: '_blank',
      rel: 'noopener',
    },
  })
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
  async handleHotUpdate({ file }: { file: string }) {
    if (file.includes('posts') && !file.includes('public'))
      await buildPosts()
  },
})

function formatDate(date: Date) {
  return date
    .toISOString()
    .replace(/T/g, ' ')
    .replace(/\.\d{3}Z/, '')
}

interface Post {
  title: string
  date: string
  tags: string[]
  url: string
  content: string
}

async function collectEachPostAndImages(file: string): Promise<Post | void> {
  if (file.endsWith('.md')) {
    const blogName = path.basename(file, '.md')
    const blogPath = path.join('posts', file)
    const content = await fs.readFile(blogPath, { encoding: 'utf-8' })
    const parsed = frontmatter(content)
    return {
      title: parsed.data.title,
      date: String(parsed.data.date.valueOf()),
      tags: parsed.data.tags,
      url: blogName,
      content: parsed.content,
    }
  }
  else if (!path.extname(file)) {
    const dirname = path.join('posts', file)
    const images = await fs.readdir(dirname)
    // Copy images in parallel for better performance
    await Promise.all(images.map(image =>
      fs.copyFile(path.join(dirname, image), path.join(publicImages, image)),
    ))
  }
}

async function collectPostsAndImages(): Promise<Post[]> {
  const files = await fs.readdir('posts')
  const posts = (await Promise.all(files.map(collectEachPostAndImages))).filter(
    (file): file is Post => file !== undefined,
  )
  posts.sort((a, b) => Number(b.date) - Number(a.date))
  posts.forEach((post) => {
    post.date = formatDate(new Date(Number(post.date)))
  })
  return posts
}

function truncate(s: string, len: number) {
  const moreIndex = s.indexOf('<!-- more -->')
  if (moreIndex !== -1)
    return s.slice(0, moreIndex)
  return s.length > len ? s.slice(0, len) : s
}

function removeRSSLastBuildDate(xml: string) {
  return xml.replace(/<lastBuildDate>.*<\/lastBuildDate>/, '')
}

async function generateRSS(posts: Post[]) {
  const feed = new RSS({
    title: 'liuly\'s Blog',
    description: 'liuly 的个人 Blog',
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.xml`,
    copyright: '2024 liuly',
    language: 'zh-cn',
  })
  for (const post of posts) {
    feed.item({
      title: post.title,
      url: `${SITE_URL}/posts/${post.url}`,
      description: descriptionRenderer.render(truncate(post.content, 100)),
      date: `${post.date} UTC+8`,
    })
  }
  const xml = removeRSSLastBuildDate(feed.xml())
  await fs.writeFile(path.join('public', 'feed.xml'), xml)
}

async function checkPostHasChanged(post: Post) {
  const src = path.join('posts', `${post.url}.md`)
  const dst = path.join(publicPosts, `${post.url}.htm`)
  const srcStat = await fs.stat(src)
  const dstStat = await fs.stat(dst).catch(() => null)
  return dstStat === null || srcStat.mtime > dstStat.mtime
}

function generateDescription(content: string, maxLength = 160): string {
  return content
    .replace(/[#*~`><!-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
}

async function generateStaticPost(htmlTemplate: string, post: Post) {
  if (!await checkPostHasChanged(post))
    return
  const rendered = postRenderer.render(post.content)
  await fs.writeFile(path.join(publicPosts, `${post.url}.htm`), rendered)
  const html = template.render(htmlTemplate, {
    title: post.title,
    url: post.url,
    description: generateDescription(post.content),
    tags: post.tags,
    content: rendered,
  })
  await fs.writeFile(path.join('public', 'posts', `${post.url}.html`), html)
}

async function generateStaticPosts(posts: Post[]) {
  const htmlTemplate = await fs.readFile(path.join('build', 'template.html'), {
    encoding: 'utf-8',
  })
  await Promise.all(posts.map(post => generateStaticPost(htmlTemplate, post)))
}

async function generateSiteSummary(posts: Post[], firstPageAbstracts: string[]) {
  const summary = {
    posts: posts.map((post) => {
      return Object.fromEntries(Object.entries(post).filter(([k]) => k !== 'content'))
    }),
    firstPageAbstracts,
  }
  await fs.writeFile(path.join('src/jsons', 'summary.json'), JSON.stringify(summary))
}

async function generatePostAbstracts(abstracts: string[]) {
  await fs.writeFile(path.join('public', 'page.json'), JSON.stringify(abstracts))
}

async function buildPosts() {
  if (!await fileExists(publicImages))
    await fs.mkdir(publicImages)
  if (!await fileExists(publicPosts))
    await fs.mkdir(publicPosts)

  const posts = await collectPostsAndImages()
  const abstracts = posts.map(post => postRenderer.render(truncate(post.content, 100)))

  await Promise.all([
    generateRSS(posts),
    generateStaticPosts(posts),
    generatePostAbstracts(abstracts),
    generateSiteSummary(posts, abstracts.slice(0, 10)),
  ])
}
