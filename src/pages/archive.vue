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

const toc = computed(() => groupedSummary.value.map(([year]) => ({
  id: `archive-${year}`,
  text: year,
  tab: -1,
})))
</script>

<template>
  <div class="flex items-start">
    <div class="lg:card bg-surface px-6 py-6 flex-grow min-w-0">
      <div class="archive-content m-auto text-left">
        <section v-for="[year, posts] in groupedSummary" :key="year" class="archive-year-group">
          <h2 :id="`archive-${year}`" class="archive-year mb-2 border-b text-xl">
            {{ year }}
          </h2>
          <router-link
            v-for="post in posts" :key="post.url"
            class="archive-item border-b flex items-center hover:text-accent" :to="`/posts/${post.url}`"
          >
            <time class="archive-date flex-shrink-0" :datetime="post.date.slice(0, 10)">{{ post.date.slice(0, 10) }}</time>
            <span>{{ post.title }}</span>
          </router-link>
        </section>
      </div>
    </div>
    <Toc
      v-if="toc.length" :items="toc"
      class="<xl:hidden w-[256px] flex-shrink-0 sticky top-20 overflow-auto text-left"
      style="max-height: calc(100vh - 80px)"
    />
  </div>
</template>

<style scoped>
.archive-content {
  max-width: 1000px;
}

.archive-year-group + .archive-year-group {
  margin-top: 2.75rem;
}

.archive-year {
  padding-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.5;
}

.archive-item {
  min-height: 3.25rem;
  transition: color 0.2s;
}

.archive-date {
  width: 7rem;
  color: var(--muted);
  font-size: 0.8rem;
}
</style>
