<script setup lang="ts">
import { Ref } from 'vue';
import { PostSummary, SummaryKey } from '~/types'

import details from '../../assets/page.json'
const summary = inject(SummaryKey) as PostSummary[]

const post_infos = details.map((e, i) => { return { 'detail': e, 'summary': summary[i] } })

const pages_max = Math.ceil(post_infos.length / 10)
const now_page = inject('page') as Ref<number>

const slices = computed(() => post_infos.slice((now_page.value - 1) * 10, now_page.value * 10))
</script>

<template>
  <template v-for="ele in slices">
    <n-card
      class="mb-4 px-2"
      header-style="font-size:2em; margin-top:1em"
      footer-style="text-align: left"
    >
      <template #header>
        <router-link :to="`/posts/${encodeURIComponent(ele.summary.url)}`">{{ ele.summary.title }}</router-link>
      </template>
      {{ ele.summary.date }}
      <markdown-it :source="ele.detail"></markdown-it>
      <router-link class="show-more" :to="`/posts/${encodeURIComponent(ele.summary.url)}`">查看更多</router-link>
      <template #footer>
        <span v-for="tag in ele.summary.tags" class="mr-2 text-slate-500">
          <router-link :to="`/tags/${encodeURIComponent(tag)}`">#{{ tag }}</router-link>
        </span>
      </template>
    </n-card>
  </template>
  <div class="my-10" style="display: inline-block;">
    <n-pagination v-model:page="now_page" :page-count="pages_max" />
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

<route lang="yaml">
meta:
  layout: default
</route>
