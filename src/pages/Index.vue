<route>
{
  path: '/:page([0-9]+)?',
  meta: { homePage: true },
}
</route>

<script setup lang="ts">
import { homePostsCache } from '~/modules/homePosts'
import { HOME_PAGE_SIZE, homePageCount } from '~/utils/homePagination'

const props = defineProps<{
  page?: string
}>()
const page = computed(() => Number(props.page || 1))
const { summary } = useSummary()
const homePageMax = homePageCount(summary.length)
const posts = computed(() => {
  const offset = (page.value - 1) * HOME_PAGE_SIZE
  return homePostsCache.get(page.value)!
    .map((detail, i) => ({ detail, summary: summary[offset + i] }))
})
</script>

<template>
  <article v-for="post in posts" :key="post.summary.url" class="mb-4 p-7 card">
    <div class="text-3xl font-medium my-4">
      <router-link :to="`/posts/${encodeURIComponent(post.summary.url)}`" class="hover:text-accent">
        {{
          post.summary.title
        }}
      </router-link>
    </div>
    {{ post.summary.date }}
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="md-blog md-blog-home m-auto text-left" v-html="post.detail" />
    <router-link class="show-more" :to="`/posts/${encodeURIComponent(post.summary.url)}`">
      查看更多
    </router-link>
    <div class="text-left mt-6">
      <span v-for="tag in post.summary.tags" :key="tag" class="mr-2 text-muted">
        <router-link :to="`/tags/${tag}`" class="hover:text-accent">#{{ tag }}</router-link>
      </span>
    </div>
  </article>
  <div class="my-10 inline-block" :data-home-page="page">
    <Pagination :page="page" :page-max="homePageMax" />
  </div>
</template>
