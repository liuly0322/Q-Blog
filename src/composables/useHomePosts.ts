import firstPageAbstracts from '~/jsons/firstPageAbstracts.json'

const { summary } = useSummary()

const data = ref<string[]>()
if (!import.meta.env.SSR) {
  fetch('/page.json')
    .then(res => res.json() as Promise<string[]>)
    .then((value) => { data.value = value })
}

const { page } = usePage()

const abstracts = computed(() => data.value ?? firstPageAbstracts)

const posts = computed(() => abstracts.value
  .map((detail: string, i: number) => ({
    detail,
    summary: summary[i],
  }))
  .slice((page.value - 1) * 10, page.value * 10))

export default () => ({ posts })
