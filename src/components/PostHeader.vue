<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'

defineProps<{
  post: PostSummary
}>()
</script>

<template>
  <div class="md-blog m-auto text-left">
    <h1>{{ post.title }}</h1>
    <p>{{ post.date }}</p>
    <div class="border-b pb-4">
      <BlogTag v-for="tag in post.tags" :key="tag" class="mr-2 mb-4">
        <router-link :to="`/tags/${encodeURIComponent(tag)}`" class="!text-inherit !no-underline">
          {{ tag }}
        </router-link>
      </BlogTag>
    </div>
  </div>
</template>
