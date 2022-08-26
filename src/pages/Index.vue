<script setup lang="ts">
const { data } = useFetch('/page.json').json()
const summary = useSummary()
const { page, pageMax } = usePage()
const posts = computed(() => {
  const currSummary = data.value ?? Array(summary.value.length).fill('')
  return currSummary
    .map((detail: string, i: number) => ({
      detail: detail,
      summary: summary.value[i],
    }))
    .slice((page.value - 1) * 10, page.value * 10)
})
</script>

<template>
  <template v-for="post in posts" :key="post">
    <n-card
      class="mb-4 px-2"
      header-style="font-size:2em; margin-top:1em"
      footer-style="text-align: left"
    >
      <template #header>
        <router-link :to="`/posts/${encodeURIComponent(post.summary.url)}`">{{
          post.summary.title
        }}</router-link>
      </template>
      {{ post.summary.date }}
      <MarkdownIt :source="post.detail" />
      <router-link
        class="show-more"
        :to="`/posts/${encodeURIComponent(post.summary.url)}`"
        >查看更多</router-link
      >
      <template #footer>
        <span
          v-for="tag in post.summary.tags"
          :key="tag"
          class="mr-2 text-slate-500"
        >
          <router-link :to="`/tags/${encodeURIComponent(tag)}`"
            >#{{ tag }}</router-link
          >
        </span>
      </template>
    </n-card>
  </template>
  <div class="my-10 inline-block">
    <n-pagination v-model:page="page" :page-count="pageMax" />
  </div>
</template>

<style scoped>
.show-more {
  line-height: 1em;
  padding: 6px 15px;
  border-radius: 15px;
  color: #fff;
  background: #258fb8;
  text-shadow: 0 1px #1e7293;
  text-decoration: none;
}
</style>
