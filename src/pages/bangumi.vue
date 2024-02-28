<script setup lang="ts">
interface Anime {
  updated_at: string
  comment: string
  tags: { name: string, count: number }[]
  subject: {
    date: string
    images: {
      small: string
      grid: string
      large: string
      medium: string
      common: string
    }
    name: string
    name_cn: string
    short_summary: string
    tags: { name: string, count: number }[]
    score: number
    type: number
    id: number
    eps: number
    volumes: number
    collection_total: number
    rank: number
  }
  subject_id: number
  vol_status: number
  ep_status: number
  subject_type: number
  type: number
  rate: number
  private: boolean
}
const animeList = ref([] as Anime[])

const loading = ref(true)
const pageSize = 12
let page = 0

async function fetchAnimeList() {
  const offset = page * pageSize
  try {
    const res = await fetch(
      `https://api.bgm.tv/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${pageSize}&offset=${offset}`,
    )
    if (!res.ok)
      throw new Error('Network response was not ok')

    const data = await res.json()
    const totalSize = data.total
    animeList.value = animeList.value.concat(data.data)
    if (offset + data.data.length >= totalSize)
      loading.value = false

    page++
  }
  catch (error) {
    loading.value = false
  }
}

let ticking = false

async function updateOnScroll(event: Event) {
  if (ticking || !loading.value)
    return
  ticking = true
  const element = event.target as HTMLElement
  const isBottom = document.documentElement.scrollTop
    ? document.documentElement.scrollHeight - document.documentElement.scrollTop <= document.documentElement.clientHeight + 100
    : element.scrollHeight - element.scrollTop <= element.clientHeight + 100
  if (isBottom)
    await fetchAnimeList()

  ticking = false
}

onMounted(async () => {
  await fetchAnimeList()
  nextTick(() => {
    const element = document.querySelector('.n-layout-content .n-scrollbar-container')
    element?.addEventListener('scroll', updateOnScroll)
    document.addEventListener('scroll', updateOnScroll)
  })
})

onUnmounted(() => {
  const element = document.querySelector('.n-layout-content .n-scrollbar-container')
  element?.removeEventListener('scroll', updateOnScroll)
  document.removeEventListener('scroll', updateOnScroll)
})

function timeToDate(time: string) {
  const date = new Date(time)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
</script>

<template>
  <h1 class="text-3xl font-bold">
    动画列表
  </h1>
  <p class="mt-5">
    我在 <a href="https://bangumi.tv/user/undef_baka" target="_blank" rel="noopener noreferrer">bangumi</a>
    上对部分看过动画的评分与短评（Optional）。
  </p>
  <div v-if="animeList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
    <n-card
      v-for="anime in animeList" :key="anime.subject.id"
      content-style="display:flex;flex-direction:column;justify-content:space-between;padding:1em" style="height:100%"
    >
      <div class="mb-2">
        <a :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer">
          <img :src="anime.subject.images.medium" :alt="anime.subject.name" class="rounded-lg w-full">
        </a>
        <div class="mt-2">
          <a
            :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer"
            class="text-lg font-bold"
          >
            {{ anime.subject.name_cn || anime.subject.name }}
          </a>
          <n-ellipsis
            class="text-sm text-gray-500 mt-4 whitespace-pre-line" expand-trigger="click" line-clamp="2"
            :tooltip="false"
          >
            {{ anime.subject.short_summary }}
          </n-ellipsis>
        </div>
      </div>
      <hr>
      <div class="mt-2">
        <p v-if="anime.comment" class="mt-2 text-sm">
          {{ anime.comment }}
        </p>
        <div class="text-sm mt-4 flex justify-center">
          <n-rate :default-value="anime.rate / 2" readonly allow-half />
          <span class="text-gray-500 ml-2 text-xs mt-1">
            {{ timeToDate(anime.updated_at) }}
          </span>
        </div>
      </div>
    </n-card>
  </div>
  <div v-if="loading" class="text-center mt-5">
    <n-spin size="large" />
  </div>
</template>

<style scoped>
a {
  color: #258fb8;
}

a:hover {
  text-decoration: underline;
}
</style>
