<script setup lang="ts">
import { getCurrentSeason, getCurrentYear } from '~/utils/date'
import IconRedHeart from '~icons/fluent-emoji-flat/red-heart'

const { postsOnPage } = usePage()
</script>

<template>
  <div v-for="post in postsOnPage" :key="post.summary.url" class="mb-4 p-7 card">
    <div class="text-3xl font-medium my-4">
      <router-link :to="`/posts/${encodeURIComponent(post.summary.url)}`">
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
  </div>
  <div class="my-10 inline-block">
    <Pagination />
  </div>
  <footer class="flex flex-col items-center justify-center pt-8 pb-12 leading-8 border-t-[0.8px] dark:border-white/9">
    <p class="flex items-center">
      <span>© 2021 - {{ getCurrentYear() }}</span>
      <span class="px-2.5 mt-1 animate-heartBeat animate-infinite"><IconRedHeart /></span>
      <span>{{ getCurrentSeason() }}</span>
    </p>
    <div class="flex items-center">
      <img src="/icp.gov.moe.png" alt="moe-icp" width="32" height="32">
      <a href="https://icp.gov.moe/?keyword=20240322" class="pl-4 blue-link" target="_blank">萌 ICP 备 20240322 号</a>
    </div>
  </footer>
</template>
