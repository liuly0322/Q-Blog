import data from '~/jsons/summary.json'

function counter<T>(arr: Array<T>): Map<T, number> {
  return arr.reduce((acc, e) => acc.set(e, (acc.get(e) ?? 0) + 1), new Map<T, number>())
}

export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}

const summary: PostSummary[] = data.posts

const tags = summary.flatMap(post => post.tags)
const tagCount = [...counter(tags).entries()]
  .sort((tag_a, tag_b) => tag_b[1] - tag_a[1])
  .map(([s, n]) => ({ content: s, times: n }))

export default () => ({ summary, tagCount })
