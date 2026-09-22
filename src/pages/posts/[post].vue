<script setup lang="ts">
import { getRandInt } from '~/utils/math'

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

const loading = ref(true)
const data = asyncComputed(async (onCancel) => {
  loading.value = true
  const data = await (async () => {
    if (currPost.value === emptySummary)
      return '<p><strong>找不到页面了 :(</strong></p>'
    return await getCachedPostData(props.post, onCancel)
  })()
  loading.value = false
  return data
}, '')

const { scroll, deferScroll } = useCustomScroll()
const postContentEle = ref<HTMLElement>()
watchEffect(() => {
  props.post && scroll({ left: 0, top: 0 })
})
watch(data, () => {
  postContentEle.value && setToc(postContentEle.value)
  nextTick(deferScroll)
}, { flush: 'post' })
</script>

<template>
  <article class="lg:card px-6">
    <PostHeader :post="currPost" />
    <div v-show="loading" class="post-skeleton-list my-1.6em text-left">
      <template v-for="i in 4" :key="i">
        <div
          v-for="line in getRandInt(1, 3)"
          :key="`skeleton-${i}-${line}`"
          class="post-skeleton-line"
        />
        <div
          class="post-skeleton-line"
          :style="{ width: `${getRandInt(20, 80)}%` }"
        />
      </template>
    </div>
    <div v-show="!loading">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div ref="postContentEle" class="md-blog m-auto text-left" v-html="data" />
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
