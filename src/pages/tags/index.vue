<script setup lang="ts">
type BlogTagSize = 'small' | 'medium' | 'large'

const { tagCount } = useSummary()
const breakpoints: [BlogTagSize, number][] = [
  ['large', tagCount[Math.floor(tagCount.length / 3)].times],
  ['medium', tagCount[Math.floor((tagCount.length * 2) / 3)].times - 1],
  ['small', -1],
]
function computeSize(times: number): BlogTagSize {
  for (const [size, breakpoint] of breakpoints) {
    if (times > breakpoint)
      return size
  }
  return 'small'
}
</script>

<template>
  <SectionDivider title="标签" />
  <router-link v-for="tag in tagCount" :key="tag.content" :to="`/tags/${encodeURIComponent(tag.content)}`">
    <BlogTag :size="computeSize(tag.times)" class="m-1 cursor-pointer">
      {{ tag.content }}: {{ tag.times }}
    </BlogTag>
  </router-link>
</template>
