<script setup lang="ts">
interface MicroBlog {
  create_time: string
  description: string
  id: number
}

const { data } = useFetch('https://120.24.73.184/notes').json()
const microBlogs = computed(() => {
  const microBlogs = (data.value ?? []).slice() as Array<MicroBlog>
  microBlogs.sort((a, b) => b.id - a.id)
  return microBlogs
})
</script>

<template>
  <n-card
    title="微博"
    :bordered="false"
    content-style="padding-top: 16px"
    size="small"
    :segmented="true"
  >
    <n-card v-for="microBlog in microBlogs" :key="microBlog.id" title="liuly" class="text-left mb-2">
      <template #header-extra>
        {{ microBlog.create_time }}
      </template>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="microBlog.description" />
    </n-card>
  </n-card>
</template>
