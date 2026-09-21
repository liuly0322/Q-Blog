<script setup lang="ts">
import type { TagProps } from 'naive-ui'

const { tagCount } = useSummary()
const breakpoints: [TagProps['size'], number][] = [
  ['large', tagCount[Math.floor(tagCount.length / 3)].times],
  ['medium', tagCount[Math.floor((tagCount.length * 2) / 3)].times - 1],
  ['small', -1],
]
function computeSize(times: number): TagProps['size'] {
  for (const [size, breakpoint] of breakpoints) {
    if (times > breakpoint)
      return size
  }
}
</script>

<template>
  <n-divider title-placement="left">
    标签
  </n-divider>
  <router-link v-for="tag in tagCount" :key="tag.content" :to="`/tags/${encodeURIComponent(tag.content)}`">
    <n-tag type="info" :size="computeSize(tag.times)" class="m-1 cursor-pointer" round>
      {{ tag.content }}: {{ tag.times }}
    </n-tag>
  </router-link>
</template>
