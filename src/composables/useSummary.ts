const { data } = useFetch('/summary.json').json()
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
  return (data.value as SiteSummary).posts
})
export default () => summary
export const firstPageAbstracts = computed(() => {
  return (data.value as SiteSummary).firstPageAbstracts
})
