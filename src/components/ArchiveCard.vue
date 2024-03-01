<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'

const props = defineProps<{
  summary: PostSummary[]
  title: string
}>()
</script>

<template>
  <n-divider title-placement="left">
    {{ props.title }}
  </n-divider>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <router-link
      v-for="post in props.summary" :key="post.url"
      class="mb-2 rounded-lg shadow-md custom-card p-4 flex flex-col justify-between" :to="`/posts/${post.url}`"
    >
      <h2 class="font-medium text-base mb-4 mt-2">
        {{ post.title }}
      </h2>
      <div class="text-xs text-gray-500">
        {{ post.date }}
      </div>
      <div class="mt-2 mx-2">
        <n-tag v-for="tag in post.tags" :key="tag" class="m-0.5" type="success" size="small" round>
          <router-link :to="`/tags/${encodeURIComponent(tag)}`">
            {{ tag }}
          </router-link>
        </n-tag>
      </div>
    </router-link>
  </div>
</template>
