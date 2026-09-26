import data from '~/jsons/summary.json'
import { counter } from '~/utils/array'

export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}

const summary: PostSummary[] = data.posts
const firstPageAbstracts = data.firstPageAbstracts

const tags = summary.flatMap(post => post.tags)
const tagCount = [...counter(tags).entries()]
  .sort((tag_a, tag_b) => tag_b[1] - tag_a[1])
  .map(([s, n]) => ({ content: s, times: n }))

export default () => ({ summary, firstPageAbstracts, tagCount })
