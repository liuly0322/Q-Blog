<script setup lang="ts">
import { PostSummary } from '~/composables/useSummary'
// eslint-disable-next-line no-unused-vars
const props = defineProps<{
  post: PostSummary
}>()
</script>

<template>
  <div class="md-blog m-auto text-left">
    <h1>{{ post.title }}</h1>
    <p>{{ post.date }}</p>
    <div class="border-b pb-4">
      <n-tag
        v-for="tag in post.tags"
        :key="tag"
        class="mr-2 mb-4"
        type="info"
        round
      >
        <router-link
          :to="`/tags/${encodeURIComponent(tag)}`"
          class="!text-inherit"
          >{{ tag }}</router-link
        >
      </n-tag>
    </div>
  </div>
</template>
