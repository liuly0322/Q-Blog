import type { PostSummary } from '../src/composables/useSummary'
import fs from 'node:fs/promises'
import path from 'node:path'
import frontmatter from 'frontmatter'
import markdownIt from 'markdown-it'
import RSS from 'rss'
import { SITE_URL } from '../src/pageMeta.ts'
import { getCurrentYear } from '../src/utils/date.ts'
import extractAbstract from './utils/extractAbstract.ts'
import mdImageSizePlugin from './utils/mdImageSizePlugin.ts'

const rssRenderer = markdownIt()
  .use(mdImageSizePlugin(SITE_URL))

function removeRSSLastBuildDate(xml: string) {
  return xml.replace(/<lastBuildDate>.*<\/lastBuildDate>/, '')
}

async function renderPostAbstract(url: string) {
  const markdown = frontmatter(await fs.readFile(path.join('posts', `${url}.md`), 'utf8')).content
  return rssRenderer.render(extractAbstract(markdown))
}

export default async function buildRSS() {
  const { posts } = JSON.parse(await fs.readFile('src/jsons/summary.json', 'utf8')) as { posts: PostSummary[] }
  const feed = new RSS({
    title: 'liuly\'s Blog',
    description: 'liuly 的个人 Blog',
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.xml`,
    copyright: `${getCurrentYear()} liuly`,
    language: 'zh-cn',
  })
  for (const post of posts) {
    feed.item({
      title: post.title,
      url: `${SITE_URL}/posts/${post.url}`,
      description: await renderPostAbstract(post.url),
      date: `${post.date} UTC+8`,
    })
  }
  const xml = removeRSSLastBuildDate(feed.xml())
  await fs.writeFile(path.join('dist', 'feed.xml'), xml)
}
