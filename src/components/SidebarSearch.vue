<script setup lang="ts">
const summary = useSummary()

const searchPattern: Ref<string | undefined> = ref('')
const searchOptions = computed(() => {
  const pattern = searchPattern.value?.toLowerCase().slice(0, 20)
  return (pattern && summary.value
    .filter(post => post.title.toLowerCase().includes(pattern))
    .map(post => ({
      label: post.title,
      value: post.url,
    }))) || []
})

const router = useRouter()
function handleSearch(value: any) {
  router.push(`/posts/${value}`)
}
</script>

<template>
  <n-auto-complete
    v-model:value="searchPattern"
    placeholder="搜索标题..."
    :options="searchOptions"
    clear-after-select
    blur-after-select
    @select="handleSearch"
  />
</template>
