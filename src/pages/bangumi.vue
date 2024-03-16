<script setup lang="ts">
import LineMdLoadingLoop from '~icons/line-md/loading-loop?width=48px&height=48px'

const { animeList, loading, updateAnimeList } = useBangumi()

const loadingElement = ref<HTMLElement>()
const intersectionObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting)
      updateAnimeList()
  },
)
onMounted(() => {
  loadingElement.value && intersectionObserver.observe(loadingElement.value)
})
onUnmounted(() => {
  intersectionObserver.disconnect()
})

function lineClamp(event: MouseEvent) {
  const el = event.target as HTMLElement
  const lineClamp = Array.from(el.classList).find(cls => cls.startsWith('line-clamp-'))?.split('-')[2]
  if (lineClamp) {
    const webkitLineClamp = el.style.getPropertyValue('-webkit-line-clamp') || lineClamp
    el.style.setProperty('-webkit-line-clamp', webkitLineClamp === lineClamp ? 'unset' : lineClamp)
  }
}
</script>

<template>
  <h1 class="text-3xl font-bold">
    动画列表
  </h1>
  <p class="mt-5">
    我在 <a href="https://bangumi.tv/user/undef_baka" class="blue-link" target="_blank" rel="noopener noreferrer">bangumi</a>
    上对部分看过动画的评分与短评（Optional）。
  </p>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
    <div
      v-for="anime in animeList" :key="anime.subject.id"
      class="flex flex-col justify-between card p-3 <sm:flex-row <sm:items-center"
    >
      <a class="mb-2 <sm:flex-shrink-0 <sm:basis-2/5" :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer">
        <img :src="anime.subject.images.medium" :alt="anime.subject.name" class="rounded-lg w-full" style="aspect-ratio: 5 / 7;">
      </a>

      <div class="<sm:ml-4 flex flex-col justify-between flex-grow text-sm">
        <a
          :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer"
          class="mt-2 text-lg blue-link font-bold"
        >
          {{ anime.subject.name_cn || anime.subject.name }}
        </a>

        <div class="cursor-pointer line-clamp-2 text-gray-500 mt-4 mb-2 whitespace-pre-line" @click="lineClamp">
          {{ anime.subject.short_summary }}
        </div>

        <hr>

        <div v-if="anime.comment" class="cursor-pointer line-clamp-3 mt-4" @click="lineClamp">
          {{ anime.comment }}
        </div>

        <div class="mt-4 flex flex-wrap justify-center">
          <n-rate :default-value="anime.rate / 2" readonly allow-half />
          <span class="text-gray-500 ml-2 text-xs mt-1 <sm:hidden">
            {{ anime.updated_at }}
          </span>
        </div>
      </div>
    </div>
  </div>
  <div v-if="loading" ref="loadingElement" class="text-center pt-5">
    <LineMdLoadingLoop style="color: #18a058;" />
  </div>
</template>
