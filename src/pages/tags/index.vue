<script setup lang="ts">
type BlogTagSize = 'small' | 'medium' | 'large'

const { tagCount } = useSummary()
const breakpoints: [BlogTagSize, number][] = [
  ['large', tagCount[Math.floor(tagCount.length / 3)].times],
  ['medium', tagCount[Math.floor((tagCount.length * 2) / 3)].times - 1],
]
function computeSize(times: number): BlogTagSize {
  return breakpoints.find(([, min]) => times > min)?.[0] ?? 'small'
}
</script>

<template>
  <SectionDivider title="标签" />
  <router-link v-for="tag in tagCount" :key="tag.content" :to="`/tags/${tag.content}`">
    <BlogTag :size="computeSize(tag.times)" class="m-1">
      {{ tag.content }}: {{ tag.times }}
    </BlogTag>
  </router-link>
</template>
