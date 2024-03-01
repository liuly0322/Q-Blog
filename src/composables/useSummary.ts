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
export default () => summary
export const firstPageAbstracts = computed(() => {
  return data.value?.firstPageAbstracts || []
})
