<script setup lang="ts">
import type { PostSummary } from '~/composables/useSummary'

const { summary } = useSummary()

const groupedSummary = computed(() => {
  const groups = new Map<string, PostSummary[]>()
  for (const post of summary) {
    const year = post.date.slice(0, 4)
    const group = groups.get(year) ?? []
    group.push(post)
    groups.set(year, group)
  }
  return [...groups.entries()]
})
</script>

<template>
  <div class="archive-content text-left">
    <section v-for="[year, posts] in groupedSummary" :key="year" class="archive-year-group">
      <h2 class="archive-year">
        {{ year }}
      </h2>
      <router-link
        v-for="post in posts" :key="post.url"
        class="archive-item flex items-center" :to="`/posts/${post.url}`"
      >
        <time class="archive-date flex-shrink-0">{{ post.date.slice(5, 10) }}</time>
        <span class="archive-title">{{ post.title }}</span>
      </router-link>
    </section>
  </div>
</template>

<style scoped>
.archive-content {
  width: min(calc(100% - 3.5rem), 700px);
  margin: 0 auto;
  padding-top: 1.5rem;
}

.archive-year-group + .archive-year-group {
  margin-top: 2.75rem;
}

.archive-year {
  margin: 0 0 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(107, 114, 128, 0.25);
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
}

.archive-item {
  min-height: 3.25rem;
  border-bottom: 1px solid rgba(107, 114, 128, 0.14);
  color: inherit;
  transition: color 0.2s;
}

.archive-item:hover {
  color: #42b883;
}

.archive-date {
  width: 4.5rem;
  color: #9ca3af;
  font-size: 0.8rem;
}

.archive-title {
  line-height: 1.5;
}

html.dark .archive-year {
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.16);
}

html.dark .archive-item {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
