<script setup lang="ts">
import type { PropType } from 'vue'
import type { PostSummary } from '~/composables/useSummary'

const props = defineProps({
  summary: {
    type: Array as PropType<PostSummary[]>,
    required: true,
  },
  title: {
    type: String as PropType<string>,
    required: true,
  },
})
</script>

<template>
  <n-divider title-placement="left">{{ props.title }}</n-divider>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <router-link v-for="post in props.summary" :key="post.url" class="flex" :to="`/posts/${post.url}`">
      <n-card class="mb-2" :title="post.title" size="small"
        content-style="display:flex;flex-direction:column;justify-content:center">
        <div>{{ post.date }}</div>
        <div class="mt-2 mx-2">
          <n-tag v-for="tag in post.tags" :key="tag" class="m-0.5" type="success" size="small" round>
            <router-link :to="`/tags/${encodeURIComponent(tag)}`">
              {{ tag }}
            </router-link>
          </n-tag>
        </div>
      </n-card>
    </router-link>
  </div>
</template>
