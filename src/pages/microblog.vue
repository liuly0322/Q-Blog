<script setup lang="ts">
interface MicroBlog {
  create_time: string
  description: string
  id: number
}

const { data } = useFetch('http://120.24.73.184:7777/notes').json()
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
      {{ microBlog.description }}
    </n-card>
  </n-card>
</template>

<style>
  .header{
    font-weight: bold;
    line-height: 1.1em;
    margin: 1.1em 0;
    font-size: 2em;
  }
</style>
