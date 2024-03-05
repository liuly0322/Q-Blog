<script setup lang="ts">
import type { AsyncComputedOnCancel } from '@vueuse/core'

const props = defineProps<{ post: string }>()
const { summary } = useSummary()
const currPost = computed(() =>
  summary.value.find(post => props.post.includes(post.url)) ?? {
    url: '',
    title: '',
    tags: [],
    date: '',
  },
)

const title = computed(() => {
  return `${currPost.value.title} | llyのblog`
})
useTitle(title)
const { setToc, enableToc } = useToc()
onBeforeUnmount(() => {
  if (document)
    document.title = 'llyのblog'
  enableToc.value = false
})

function getRand(min: number, max: number): number {
  return min + Math.round(Math.random() * (max - min))
}

async function getPostData(onCancel: AsyncComputedOnCancel) {
  const postName = (parts => parts.pop() || parts.pop() || '')(props.post.split('/')).split('.')[0]
  const cached = sessionStorage.getItem(postName)
  if (cached)
    return cached

  const abortController = new AbortController()
  onCancel(() => abortController.abort())
  const data = await fetch(`/posts/${postName}.htm`, { signal: abortController.signal })
    .then(res => res.text())
  sessionStorage.setItem(postName, data)
  return data
}

const loading = ref(true)
const data = asyncComputed(async (onCancel) => {
  loading.value = true
  const data = await getPostData(onCancel)
  loading.value = false
  return data
}, '')

const { deferScroll } = useCustomScroll()
const postContentEle = ref<HTMLElement | null>(null)
watch(data, () => {
  nextTick(() => {
    deferScroll()
    postContentEle.value && setToc(postContentEle.value)
  })
})
</script>

<template>
  <PostHeader :post="currPost" />
  <div v-show="loading" class="mt-1.6em text-left">
    <template v-for="i in 4" :key="i">
      <n-skeleton text :repeat="getRand(1, 3)" />
      <n-skeleton text :style="`width: ${getRand(20, 80)}%`" />
    </template>
  </div>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-show="!loading" ref="postContentEle" class="md-blog m-auto text-left" v-html="data" />
  <PostFooter :post="currPost.url" />
  <Comment :post="currPost" />
</template>
