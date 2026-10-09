<script setup lang="ts">
import { restorePostScroll } from '~/modules/navigationScroll'
import { getCachedPostData, postCache } from '~/modules/postData'

const props = defineProps<{ post: string }>()
const { summary } = useSummary()
const notFoundSummary = Object.freeze({ url: '', title: '404 Not Found', tags: [], date: '' })
const postSummary = computed(() => summary.find(post => props.post === post.url) ?? notFoundSummary)

const NOT_FOUND = '<p><strong>找不到页面了 :(</strong></p>'
const LOAD_FAILED = '<p><strong>文章加载失败，请刷新重试。</strong></p>'

function knownContent(postName: string) {
  if (postSummary.value === notFoundSummary)
    return NOT_FOUND
  return postCache.get(postName)
}

const initialContent = knownContent(props.post)
const postHtml = ref(initialContent ?? '')
const loading = ref(initialContent === undefined)

let cancelLoad = () => {}
async function loadPost(post: string) {
  cancelLoad()

  const known = knownContent(post)
  if (known !== undefined) {
    postHtml.value = known
    loading.value = false
    return
  }

  let cancelled = false
  let abort: (() => void) | undefined
  cancelLoad = () => {
    cancelled = true
    abort?.()
  }

  loading.value = true

  const content = await getCachedPostData(post, (callback) => {
    abort = callback
  }).catch(() => LOAD_FAILED)
  if (cancelled)
    return

  postHtml.value = content
  loading.value = false
}

if (initialContent === undefined)
  void loadPost(props.post)
watch(() => props.post, loadPost)

const postBody = ref<HTMLElement>()

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
    readHeadings(parse(postHtml.value))
  })
}
else if (postHtml.value) {
  const body = document.querySelector<HTMLElement>('[data-post-body]')
  body && readHeadings(body)
}

const navigationCounter = ref(0)
const removeAfterEach = useRouter().afterEach(() => {
  navigationCounter.value++
})
onUnmounted(removeAfterEach)

onMounted(() => {
  watch([postHtml, navigationCounter], async (_, _previous, onCleanup) => {
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
    readHeadings(postBody.value!)

    // Restore scroll position after toc has been updated.
    await nextTick()
    if (cancelled)
      return
    restorePostScroll()
  }, { immediate: true })
})
</script>

<template>
  <div class="flex items-start">
    <article class="lg:card bg-surface px-6 flex-grow min-w-0" data-pagefind-body>
      <PostHeader :post="postSummary" />
      <div v-if="loading" class="my-1.6em text-left pt-0.5 animate-pulse">
        <template v-for="i in 4" :key="i">
          <div v-for="line in (i % 3) + 1" :key="`skeleton-${i}-${line}`" class="h-3.5 mb-2 bg-line" />
          <div class="h-3.5 mb-2 bg-line" :style="{ width: `${30 + i * 12}%` }" />
        </template>
      </div>
      <div v-show="!loading">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div ref="postBody" class="md-blog m-auto text-left" data-post-body v-html="postHtml" />
        <PostFooter :post="postSummary.url" data-pagefind-ignore />
        <Comment :post="postSummary" data-pagefind-ignore />
      </div>
    </article>
    <Toc
      v-if="toc.length" :items="toc"
    />
  </div>
</template>
