export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}

let summary: PostSummary[] = []
let tagCount: { content: string, times: number }[] = []

export function setSummary(posts: PostSummary[]) {
  summary = posts
  tagCount = [...Map.groupBy(summary.flatMap(post => post.tags), tag => tag)]
    .map(([content, tags]) => ({ content, times: tags.length }))
    .sort((a, b) => b.times - a.times)
}

export default () => ({ summary, tagCount })
