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
onBeforeUnmount(() => {
  if (document) document.title = 'llyのblog'
})

const url = computed(() => './' + props.post + '.json')
const { data } = useFetch(url, { refetch: true }).json()
</script>

<template>
  <PostHeader :post="currPost"></PostHeader>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="md-blog m-auto text-left" v-html="data"></div>
  <PostFooter :post="currPost.url"></PostFooter>
  <Comment :post="currPost" />
</template>
