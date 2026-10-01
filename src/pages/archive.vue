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
  <div class="archive-content m-auto text-left">
    <section v-for="[year, posts] in groupedSummary" :key="year" class="archive-year-group">
      <h2 class="archive-year mb-2 border-b text-xl text-gray-700 dark:text-gray-200">
        {{ year }}
      </h2>
      <router-link
        v-for="post in posts" :key="post.url"
        class="archive-item border-b flex items-center hover:text-hex-42b883" :to="`/posts/${post.url}`"
      >
        <time class="archive-date flex-shrink-0">{{ post.date.slice(5, 10) }}</time>
        <span>{{ post.title }}</span>
      </router-link>
    </section>
  </div>
</template>

<style scoped>
.archive-content {
  width: min(calc(100% - 3.5rem), 700px);
  padding-top: 1.5rem;
}

.archive-year-group + .archive-year-group {
  margin-top: 2.75rem;
}

.archive-year {
  padding-bottom: 0.5rem;
  border-bottom-color: rgba(107, 114, 128, 0.25);
  font-weight: 600;
  line-height: 1.5;
}

.archive-item {
  min-height: 3.25rem;
  border-bottom-color: rgba(107, 114, 128, 0.14);
  transition: color 0.2s;
}

.archive-date {
  width: 4.5rem;
  color: #9ca3af;
  font-size: 0.8rem;
}

html.dark .archive-year {
  border-color: rgba(255, 255, 255, 0.16);
}

html.dark .archive-item {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
