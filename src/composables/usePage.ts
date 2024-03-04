const { data } = useFetch('/page.json').json()

const { summary, firstPageAbstracts } = useSummary()
const page = ref(1)
const pageMax = computed(() => Math.ceil(summary.value.length / 10))

const postsOnPage = computed(() => {
  const currSummary = data.value ?? firstPageAbstracts.value
  return currSummary
    .map((detail: string, i: number) => ({
      detail,
      summary: summary.value[i],
    }))
    .slice((page.value - 1) * 10, page.value * 10)
})

export default () => ({ data, page, pageMax, postsOnPage })
