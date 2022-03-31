<template>
  <n-card title="博客搜索">
    <n-auto-complete
      v-model:value="searchPattern"
      placeholder="搜索"
      :options="searchOptions"
      clear-after-select
      blur-after-select
      @select="handleSearch"
    />
  </n-card>
</template>

<script setup lang="ts">
const summary = useSummary.map((post) => ({ title: post.title.toLowerCase(), url: post.url }))

const searchPattern = ref('')
const searchOptions = computed(() => {
  if (!searchPattern.value) return []
  const pattern = searchPattern.value.toLowerCase().slice(0, 20)
  return summary.filter((post) => post.title.includes(pattern)).map((post) => ({
    label: post.title,
    value: post.url
  }))
})

const router = useRouter()
function handleSearch(value: any) {
  router.push('/posts/' + value)
}
</script>
