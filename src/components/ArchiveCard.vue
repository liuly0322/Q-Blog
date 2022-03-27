<script setup lang="ts">
import type { PropType } from '@vue/runtime-core'
import { PostSummary } from '~/types'

const props = defineProps({
  summary: {
    type: Array as PropType<PostSummary[]>,
    required: true
  },
  title: {
    type: String as PropType<string>,
    required: true
  },
})
</script>

<template>
  <n-card
    :title="props.title"
    :bordered="false"
    content-style="padding: 16px 0 0 0"
    size="small"
    :segmented="true"
  >
    <div class="card-list">
      <template v-for="post in props.summary" :key="post.url">
        <router-link class="inside-card" :to="`/posts/${post.url}`">
          <n-card :key="post.url" class="mb-2" :title="post.title" size="small">
            <div>{{ post.date }}</div>
            <div class="mt-2 mx-2">
              <n-tag v-for="tag in post.tags" :key="tag" type="success" size="small" round>
                <router-link :to="`/tags/${encodeURIComponent(tag)}`">{{ tag }}</router-link>
              </n-tag>
            </div>
          </n-card>
        </router-link>
      </template>
    </div>
  </n-card>
</template>

<style scoped>
.card-list {
  columns: 300px 3;
}

.inside-card {
  break-inside: avoid;
  display: grid;
}
</style>
