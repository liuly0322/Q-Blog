<script setup lang="ts">
const { tagCount } = useSummary()

const largeTagBreakpoint = computed(
  () => tagCount.value[Math.floor(tagCount.value.length / 3)].times,
)
const smallTagBreakpoint = computed(
  () => tagCount.value[Math.floor((tagCount.value.length * 2) / 3)].times,
)
function computeSize(times: number) {
  if (times > largeTagBreakpoint.value)
    return 'large'
  if (times < smallTagBreakpoint.value)
    return 'small'
  return 'medium'
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
