const { data }: { data: Ref<SiteSummary | null> } = useFetch('/summary.json').json()
export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}
interface SiteSummary {
  firstPageAbstracts: string[]
  posts: PostSummary[]
}

const summary = computed(() => {
  return data.value?.posts || []
})
const firstPageAbstracts = computed(() => {
  return data.value?.firstPageAbstracts || []
})

function counter<T>(arr: Array<T>) {
  return arr.reduce(
    (acc: Map<T, number>, e: T) => acc.set(e, (acc.get(e) || 0) + 1),
    new Map(),
  )
}

const tagCount = computed(() => {
  const tags = summary.value.map(post => post.tags).flat()
  return [...counter(tags).entries()]
    .sort((tag_a, tag_b) => tag_b[1] - tag_a[1])
    .map(([s, n]) => ({ content: s, times: n }))
})

export default () => ({ summary, firstPageAbstracts, tagCount })
