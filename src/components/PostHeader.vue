<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'

defineProps<{
  post: PostSummary
}>()
</script>

<template>
  <div class="md-blog m-auto text-left">
    <h1>{{ post.title }}</h1>
    <p data-pagefind-ignore>{{ post.date }}</p>
    <div class="border-b pb-4" data-pagefind-ignore>
      <router-link
        v-for="tag in post.tags" :key="tag" :to="`/tags/${tag}`"
        class="blog-tag mr-2 mb-4 !no-underline"
      >
        {{ tag }}
      </router-link>
    </div>
  </div>
</template>
