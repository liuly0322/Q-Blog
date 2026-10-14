import data from '~/jsons/summary.json'

export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}

const summary: PostSummary[] = data.posts

const tagCount = [...Map.groupBy(summary.flatMap(post => post.tags), tag => tag)]
  .map(([content, tags]) => ({ content, times: tags.length }))
  .sort((a, b) => b.times - a.times)

export default () => ({ summary, tagCount })
