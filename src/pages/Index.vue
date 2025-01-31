<script setup lang="ts">
const { postsOnPage } = usePage()
</script>

<template>
  <article v-for="post in postsOnPage" :key="post.summary.url" class="mb-4 p-7 card">
    <div class="text-3xl font-medium my-4">
      <router-link :to="`/posts/${encodeURIComponent(post.summary.url)}`" class="hover:text-hex-42b883">
        {{
          post.summary.title
        }}
      </router-link>
    </div>
    {{ post.summary.date }}
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="md-blog m-auto text-left" v-html="post.detail" />
    <router-link class="show-more" :to="`/posts/${encodeURIComponent(post.summary.url)}`">
      查看更多
    </router-link>
    <div class="text-left mt-6">
      <span v-for="tag in post.summary.tags" :key="tag" class="mr-2 text-slate-500">
        <router-link :to="`/tags/${encodeURIComponent(tag)}`">#{{ tag }}</router-link>
      </span>
    </div>
  </article>
  <div class="my-10 inline-block">
    <Pagination />
  </div>
  <CommonFooter />
</template>
