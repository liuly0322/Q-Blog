<script setup lang="ts">
function counter<T>(arr: Array<T>) {
  return arr.reduce(
    (acc: Map<T, number>, e: T) => acc.set(e, (acc.get(e) || 0) + 1),
    new Map(),
  )
}

const _summary = useSummary()
const summary = computed(() => _summary.value.map(post => post.tags).flat())
const tags = computed(() =>
  [...counter(summary.value).entries()]
    .sort((tag_a, tag_b) => tag_b[1] - tag_a[1])
    .map(([s, n]) => ({ content: s, times: n })),
)

const largeSizeTimes = computed(
  () => tags.value[Math.floor(tags.value.length / 3)].times,
)
const smallSizeTimes = computed(
  () => tags.value[Math.floor((tags.value.length * 2) / 3)].times,
)
function computeSize(times: number) {
  if (times > largeSizeTimes.value)
    return 'large'
  if (times < smallSizeTimes.value)
    return 'small'
  return 'medium'
}
</script>

<template>
  <n-divider title-placement="left">
    标签
  </n-divider>
  <router-link v-for="tag in tags" :key="tag.content" :to="`/tags/${encodeURIComponent(tag.content)}`">
    <n-tag type="info" :size="computeSize(tag.times)" class="m-1 cursor-pointer" round>
      {{ tag.content }}: {{ tag.times }}
    </n-tag>
  </router-link>
</template>

<style scoped>
.n-tag:hover {
  background: rgba(171, 205, 255, 0.5);
}

html.dark .n-tag:hover {
  background: rgba(51, 102, 119, 0.5);
}
</style>
