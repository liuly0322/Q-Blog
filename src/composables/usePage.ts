const { data }: { data: Ref<string[] | null> } = useFetch('/page.json').json()

const { summary, firstPageAbstracts } = useSummary()
const page = ref(1)
const pageMax = Math.ceil(summary.length / 10)

const postsOnPage = computed(() => {
  const currSummary = data.value ?? firstPageAbstracts
  return currSummary
    .map((detail: string, i: number) => ({
      detail,
      summary: summary[i],
    }))
    .slice((page.value - 1) * 10, page.value * 10)
})

export default () => ({ data, page, pageMax, postsOnPage })
