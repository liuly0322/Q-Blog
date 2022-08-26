<script setup lang="ts">
// trick：一个用 map 计数的 util 函数
const counter = <T extends unknown>(arr: Array<T>) =>
  arr.reduce(
    (acc: Map<T, number>, e: T) => acc.set(e, (acc.get(e) || 0) + 1),
    new Map()
  )

const _summary = useSummary()
const summary = computed(() => _summary.value.map((post) => post.tags).flat())
const tags = computed(() =>
  [...counter(summary.value).entries()]
    .sort((tag_a, tag_b) => tag_b[1] - tag_a[1])
    .map(([s, n]) => ({ content: s, times: n }))
)

const largeSizeTimes = computed(
  () => tags.value[Math.floor(tags.value.length / 3)].times
)
const smallSizeTimes = computed(
  () => tags.value[Math.floor((tags.value.length * 2) / 3)].times
)
const computeSize = (times: number) => {
  if (times > largeSizeTimes.value) return 'large'
  if (times < smallSizeTimes.value) return 'small'
  return 'medium'
}
</script>

<template>
  <n-card title="标签">
    <router-link
      v-for="tag in tags"
      :key="tag"
      :to="`/tags/${encodeURIComponent(tag.content)}`"
    >
      <n-tag type="info" :size="computeSize(tag.times)" round
        >{{ tag.content }}: {{ tag.times }}</n-tag
      >
    </router-link>
  </n-card>
</template>

<style scoped>
.n-tag {
  margin: 4px;
  cursor: pointer;
}

.n-tag:hover {
  background: rgba(171, 205, 255, 0.5);
}

html.dark .n-tag:hover {
  background: rgba(51, 102, 119, 0.5);
}
</style>
