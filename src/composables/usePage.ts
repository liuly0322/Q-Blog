const page = ref(1)
const pageMax = Math.ceil(useSummary().length / 10)

export default () => ({ page, pageMax })