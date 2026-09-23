const { summary, firstPageAbstracts } = useSummary()
const { data } = import.meta.env.SSR
  ? { data: ref<string[]>() }
  : useFetch('/page.json').json<string[]>()

const { page } = usePage()

const abstracts = computed(() => data.value ?? firstPageAbstracts)

const posts = computed(() => abstracts.value
  .map((detail: string, i: number) => ({
    detail,
    summary: summary[i],
  }))
  .slice((page.value - 1) * 10, page.value * 10))

export default () => ({ posts })
