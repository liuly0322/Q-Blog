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
      <div class="max-w-[1000px] m-auto text-left flex flex-col gap-10">
        <section v-for="[year, posts] in groupedSummary" :key="year">
          <h2 :id="`archive-${year}`" class="mb-2 border-b text-xl pb-2 font-medium" style="scroll-margin-top: var(--content-top)">
            {{ year }}
          </h2>
          <router-link
            v-for="post in posts" :key="post.url"
            class="min-h-12 border-b flex items-center transition-colors hover:text-accent" :to="`/posts/${post.url}`"
          >
            <time class="w-28 text-muted text-xs flex-shrink-0" :datetime="post.date.slice(0, 10)">{{ post.date.slice(0, 10) }}</time>
            <span>{{ post.title }}</span>
          </router-link>
        </section>
      </div>
    </div>
    <Toc
      v-if="toc.length" :items="toc"
    />
  </div>
</template>
