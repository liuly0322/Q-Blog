const { width } = useWindowSize()
const isPhone = computed(() => width.value < 450)
const isTablet = computed(() => width.value < 640)

export default () => ({ width, isPhone, isTablet })
