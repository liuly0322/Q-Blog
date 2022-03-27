<script setup lang="ts">
import { PostSummary, SummaryKey } from '~/types'
const summary = (inject(SummaryKey) as PostSummary[]).map((post) => post.tags).flat()
const counter = <T>(arr: Array<T>) => arr.reduce((acc: Map<T, number>, e: T) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
const tags = [...counter(summary).entries()].sort((tag_a, tag_b) => tag_b[1] - tag_a[1])
</script>

<template>
  <n-card title="标签">
    <router-link v-for="tag in tags" :to="`/tags/${encodeURIComponent(tag[0])}`">
      <n-tag type="info" round>{{ tag[0] }}: {{ tag[1] }}</n-tag>
    </router-link>
  </n-card>
</template>

<style scoped>
.n-tag {
  margin: 4px;
  cursor: pointer;
}

.n-tag:hover {
  background: rgba(171, 205, 255, 0.5);
}

html.dark .n-tag:hover {
  background: rgba(51, 102, 119, 0.5);
}
</style>