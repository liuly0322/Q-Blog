const summary = useSummary()

const routePath = computed(() => useRoute().path)
const isPost = computed(() => routePath.value.includes('posts'))
const currPost = computed(
  () =>
    summary.value.find((post) => routePath.value.includes(post.url)) ?? {
      url: '',
      title: '',
      tags: [],
      date: '',
    }
)

export default () => ({ isPost, currPost })
