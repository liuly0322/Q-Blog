<script setup lang="ts">
const { tagCount } = useSummary()
const breakpoints: [string, number][] = [
  ['h-8.5 px-2.5', tagCount[Math.floor(tagCount.length / 3)].times],
  ['', tagCount[Math.floor((tagCount.length * 2) / 3)].times - 1],
]
function computeSizeClass(times: number): string {
  return breakpoints.find(([, min]) => times > min)?.[0] ?? 'h-5.5 px-1.5 text-xs'
}
</script>

<template>
  <SectionDivider>标签</SectionDivider>
  <router-link
    v-for="tag in tagCount" :key="tag.content" :to="`/tags/${tag.content}`"
    class="blog-tag m-1" :class="computeSizeClass(tag.times)"
  >
    {{ tag.content }}: {{ tag.times }}
  </router-link>
</template>
