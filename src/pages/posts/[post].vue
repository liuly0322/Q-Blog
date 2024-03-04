<script setup lang="ts">
const props = defineProps<{ post: string }>()
const { summary } = useSummary()
const currPost = computed(
  () =>
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
onBeforeUnmount(() => {
  if (document)
    document.title = 'llyのblog'
})

function getRand(min: number, max: number): number {
  return min + Math.round(Math.random() * (max - min))
}
const loading = ref(true)
const data = asyncComputed(async (onCancel) => {
  const postName = (parts => parts.pop() || parts.pop() || '')(props.post.split('/')).split('.')[0]
  loading.value = true

  const abortController = new AbortController()
  onCancel(() => abortController.abort())

  // session storage injected?
  if (sessionStorage) {
    const injected = sessionStorage.getItem(postName)
    if (injected) {
      loading.value = false
      return injected
    }
  }

  const url = `/posts/${postName}.htm`
  const data = await fetch(url, { signal: abortController.signal }).then(res => res.text())

  loading.value = false
  return data
}, '')
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
  <div v-show="!loading" class="md-blog m-auto text-left" v-html="data" />
  <PostFooter :post="currPost.url" />
  <Comment :post="currPost" />
</template>
