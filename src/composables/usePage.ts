const { data } = useFetch('/page.json').json()

const summary = useSummary()
const page = ref(1)
const pageMax = computed(() => Math.ceil(summary.value.length / 10))

export default () => ({ data, page, pageMax })
