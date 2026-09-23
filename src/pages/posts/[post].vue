<script setup lang="ts">
import { initialPostKey } from '~/ssg'

const props = defineProps<{ post: string }>()
const { emptySummary, getCachedPostData, getCurrentPostSummary } = usePostData()
const currPost = computed(() => getCurrentPostSummary(props.post))

const title = computed(() => {
  if (currPost.value === emptySummary)
    return 'llyのblog'
  return `${currPost.value.title} | llyのblog`
})
useTitle(title)

const { setToc, enableToc } = useToc()
onBeforeUnmount(() => {
  enableToc.value = false
})

const initialPost = inject(initialPostKey)
const data = ref('')
const loading = ref(false)

const NOT_FOUND = '<p><strong>找不到页面了 :(</strong></p>'
const LOAD_FAILED = '<p><strong>文章加载失败，请刷新重试。</strong></p>'

function knownContent(postName: string) {
  if (currPost.value === emptySummary)
    return NOT_FOUND
  if (initialPost?.post === postName)
    return initialPost.content
  return undefined
}

watch(() => props.post, async (post, _previous, onCleanup) => {
  const known = knownContent(post)
  if (known !== undefined) {
    data.value = known
    loading.value = false
    return
  }

  let cancelled = false
  let abort: (() => void) | undefined
  onCleanup(() => {
    cancelled = true
    abort?.()
  })

  loading.value = true
  const content = await getCachedPostData(post, (callback) => {
    abort = callback
  }).catch(() => LOAD_FAILED)

  if (cancelled)
    return

  data.value = content
  loading.value = false
}, { immediate: true })

const { scroll, deferScroll } = useCustomScroll()
const postContentEle = ref<HTMLElement>()
watchEffect(() => {
  props.post && scroll({ left: 0, top: 0 })
})
function updatePostDom() {
  if (postContentEle.value)
    setToc(postContentEle.value)
  nextTick(() => {
    deferScroll()
    if (window.location.hash) {
      try {
        document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView()
      }
      catch { /* Ignore malformed URL fragments. */ }
    }
  })
}
onMounted(updatePostDom)
watch(data, updatePostDom, { flush: 'post' })
</script>

<template>
  <article class="lg:card px-6">
    <PostHeader :post="currPost" />
    <div v-if="loading" class="post-skeleton-list my-1.6em text-left">
      <template v-for="i in 4" :key="i">
        <div
          v-for="line in (i % 3) + 1"
          :key="`skeleton-${i}-${line}`"
          class="post-skeleton-line"
        />
        <div
          class="post-skeleton-line"
          :style="{ width: `${30 + i * 12}%` }"
        />
      </template>
    </div>
    <div v-show="!loading">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div ref="postContentEle" class="md-blog m-auto text-left" data-post-body v-html="data" />
      <PostFooter :post="currPost.url" />
      <Comment :post="currPost" />
      <CommonFooter />
    </div>
  </article>
</template>

<style scoped>
.post-skeleton-line {
  width: 100%;
  height: 14px;
  margin-bottom: 7px;
  background: linear-gradient(
    90deg,
    #dfdfdf 25%,
    #f2f2f2 50%,
    #dfdfdf 75%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.post-skeleton-list {
  padding-top: 2px;
}

html.dark .post-skeleton-line {
  background: linear-gradient(
    90deg,
    #464646 25%,
    #5a5a5a 50%,
    #464646 75%
  );
  background-size: 400% 100%;
}

@keyframes skeleton-shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .post-skeleton-line {
    animation: none;
  }
}
</style>
