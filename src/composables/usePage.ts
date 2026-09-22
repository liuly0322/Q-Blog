const { summary } = useSummary()

const page = ref(1)
const pageMax = Math.ceil(summary.length / 10)

export default () => ({ page, pageMax })
