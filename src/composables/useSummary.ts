const { data } = useFetch('/summary.json').json()
export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}

const summary = computed(() => (data.value ?? []) as PostSummary[])
export default () => summary
