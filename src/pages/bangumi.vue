<script setup lang="ts">
import { isScrollBottom } from '~/modules/router'

const { animeList, loading, fetchAnimeList, timeToDate } = useBangumi()

function updateOnBottom() {
  if (isScrollBottom())
    fetchAnimeList()
}

let timer: number
onMounted(() => {
  updateOnBottom()
  timer = window.setInterval(updateOnBottom, 100)
})
onUnmounted(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <h1 class="text-3xl font-bold">
    动画列表
  </h1>
  <p class="mt-5">
    我在 <a href="https://bangumi.tv/user/undef_baka" target="_blank" rel="noopener noreferrer">bangumi</a>
    上对部分看过动画的评分与短评（Optional）。
  </p>
  <div v-if="animeList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
    <div
      v-for="anime in animeList" :key="anime.subject.id"
      class="flex flex-col justify-between rounded-lg shadow-md custom-card p-3 anime-card"
    >
      <a class="mb-2 anime-card-pic" :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer">
        <img :src="anime.subject.images.medium" :alt="anime.subject.name" class="rounded-lg w-full">
      </a>

      <div class="anime-card-content flex flex-col justify-between flex-grow">
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

        <hr>

        <p v-if="anime.comment" class="mt-4 text-sm">
          <n-ellipsis expand-trigger="click" line-clamp="3" :tooltip="false">
            {{ anime.comment }}
          </n-ellipsis>
        </p>

        <div class="text-sm mt-4 flex flex-wrap justify-center">
          <n-rate :default-value="anime.rate / 2" readonly allow-half />
          <span class="text-gray-500 ml-2 text-xs mt-1 anime-card-time">
            {{ timeToDate(anime.updated_at) }}
          </span>
        </div>
      </div>
    </div>
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

@media (max-width: 640px) {
  .anime-card {
    flex-direction: row;
    align-items: center;
  }
  .anime-card-pic {
    flex: 0 0 40%;
  }
  .anime-card-content {
    margin-left: 1em;
  }
  .anime-card-time {
    display: none;
  }
}
</style>
