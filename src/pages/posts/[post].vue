<script setup lang="ts">
const props = defineProps<{ post: string }>()
const summary = useSummary()
const currPost = computed(
  () =>
    summary.value.find((post) => props.post.includes(post.url)) ?? {
      url: '',
      title: '',
      tags: [],
      date: '',
    }
)

const title = computed(() => {
  return `${currPost.value.title} | llyのblog`
})
useTitle(title)

const loadingHint = ref({
  text: '加载中',
  dots: 0,
})
const timer = setInterval(() => {
  loadingHint.value = {
    text: '加载中' + '.'.repeat(loadingHint.value.dots),
    dots: (loadingHint.value.dots + 1) % 4,
  }
}, 500)

onBeforeUnmount(() => {
  if (document) document.title = 'llyのblog'
  clearInterval(timer)
})

const isDataReady = ref(false)
const data = asyncComputed(async (onCancel) => {
  isDataReady.value = false

  const abortController = new AbortController()
  onCancel(() => abortController.abort())

  const url = './' + props.post + '.htm'
  const data = await fetch(url, { signal: abortController.signal }).then((res) => res.text())

  isDataReady.value = true
  return data
}, '')
</script>

<template>
  <PostHeader :post="currPost"></PostHeader>
  <div class="mt-12" v-show="!isDataReady">
    <n-spin size="large"/>
    <p class="mt-4 text-sm text-gray-500">{{ loadingHint.text }}</p>
  </div>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="md-blog m-auto text-left" v-show="isDataReady" v-html="data"></div>
  <PostFooter :post="currPost.url"></PostFooter>
  <Comment :post="currPost" />
</template>
