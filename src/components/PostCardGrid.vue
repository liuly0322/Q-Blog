<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'

const props = defineProps<{
  summary: PostSummary[]
  title: string
}>()
</script>

<template>
  <SectionDivider :title="props.title" />
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="post in props.summary" :key="post.url"
      class="mb-2 card p-4 flex flex-col justify-between"
    >
      <h2 class="font-medium text-base mb-4 mt-2">
        <router-link
          :to="`/posts/${encodeURIComponent(post.url)}`"
          class="transition-colors hover:text-hex-42b883"
        >
          {{ post.title }}
        </router-link>
      </h2>
      <div class="text-xs text-gray-500">
        {{ post.date }}
      </div>
      <div class="mt-2 mx-2">
        <BlogTag v-for="tag in post.tags" :key="tag" class="m-0.5" size="small">
          <router-link :to="`/tags/${encodeURIComponent(tag)}`">
            {{ tag }}
          </router-link>
        </BlogTag>
      </div>
    </div>
  </div>
</template>
