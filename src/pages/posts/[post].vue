<script setup lang="ts">
import { restorePost } from '~/modules/navigationScroll'
import { initialPostKey } from '~/ssg'

const props = defineProps<{ post: string }>()
const { emptySummary, getCachedPostData, getCurrentPostSummary } = usePostData()
const currPost = computed(() => getCurrentPostSummary(props.post))

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

const postContentEle = ref<HTMLElement>()

const toc = ref<{ id: string, text: string, tab: number }[]>([])
type Heading = Pick<HTMLElement, 'id' | 'textContent' | 'tagName'>
function readHeadings(element: { querySelectorAll: (selector: string) => ArrayLike<Heading> }) {
  const headings = Array.from(element.querySelectorAll('h2,h3,h4'), heading => ({
    id: heading.id,
    text: heading.textContent ?? '',
    level: Number(heading.tagName[1]),
  }))
  const base = Math.min(...headings.map(heading => heading.level))
  toc.value = headings.map(heading => ({
    id: heading.id,
    text: heading.text,
    tab: heading.level - base - 1,
  }))
}

if (import.meta.env.SSR) {
  onServerPrefetch(async () => {
    const { parse } = await import('node-html-parser')
    readHeadings(parse(data.value))
  })
}
else {
  const body = document.querySelector<HTMLElement>('[data-post-body]')
  if (body && initialPost?.post === props.post && data.value === initialPost.content)
    readHeadings(body)
}

const navigationCounter = ref(0)
onMounted(() => {
  const removeAfterEach = useRouter().afterEach(() => {
    navigationCounter.value++
  })
  onUnmounted(() => {
    removeAfterEach()
  })
})

onMounted(() => {
  watch(() => props.post, () => window.scrollTo({ left: 0, top: 0 }), { immediate: true })
  watch([data, navigationCounter], async (_, _previous, onCleanup) => {
    // The data is not ready yet
    if (loading.value)
      return

    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    // Update toc after v-html has been updated.
    await nextTick()
    if (cancelled)
      return
    readHeadings(postContentEle.value!)

    // Restore scroll position after toc has been updated.
    await nextTick()
    if (cancelled)
      return

    if (restorePost())
      return

    if (window.location.hash) {
      try {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }
      catch { /* Ignore malformed URL fragments. */ }
    }
  }, { immediate: true })
})
</script>

<template>
  <div class="flex items-start">
    <article class="lg:card bg-surface px-6 flex-grow min-w-0" data-pagefind-body>
      <PostHeader :post="currPost" />
      <div v-if="loading" class="post-skeleton-list my-1.6em text-left">
        <template v-for="i in 4" :key="i">
          <div v-for="line in (i % 3) + 1" :key="`skeleton-${i}-${line}`" class="post-skeleton-line w-full" />
          <div class="post-skeleton-line w-full" :style="{ width: `${30 + i * 12}%` }" />
        </template>
      </div>
      <div v-show="!loading">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div ref="postContentEle" class="md-blog m-auto text-left" data-post-body v-html="data" />
        <PostFooter :post="currPost.url" data-pagefind-ignore />
        <Comment :post="currPost" data-pagefind-ignore />
      </div>
    </article>
    <Toc
      v-if="toc.length" :items="toc"
      class="<xl:hidden w-[256px] flex-shrink-0 sticky top-20 overflow-auto text-left"
      style="max-height: calc(100vh - 80px)"
    />
  </div>
</template>

<style scoped>
.post-skeleton-line {
  height: 14px;
  margin-bottom: 7px;
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    var(--surface) 50%,
    var(--border) 75%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.post-skeleton-list {
  padding-top: 2px;
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
