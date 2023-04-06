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
  return microBlogs.map((microBlog) => {
    const date = new Date(microBlog.create_time)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const padTime = (time: number) => time.toString().padStart(2, '0')
    return {
      id: microBlog.id,
      create_date: `${month} 月 ${day} 日 , ${year}`,
      create_time: `${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}`,
      description: microBlog.description,
    }
  })
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
    <div v-for="microBlog in microBlogs" :key="microBlog.id" class="my-6">
      <n-card class="w-max micro-blog-meta" content-style="padding: 0">
        <i-carbon:calendar class="align-middle text-sm" />
        {{ microBlog.create_date }}
        <span class="opacity-50 font-light">| </span>
        <i-carbon:time class="align-middle text-sm" />
        {{ microBlog.create_time }}
      </n-card>
      <n-card
        class="text-left mb-2"
        content-style="padding: 20px;"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="microBlog.description" />
      </n-card>
    </div>
  </n-card>
</template>

<style scoped>
.micro-blog-meta {
  padding: 3px 15px;
  font-size: 16px;
  border-bottom: 0px
}
</style>
