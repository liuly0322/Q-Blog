<script setup lang="ts">
import LineMdLoadingLoop from '~icons/line-md/loading-loop?width=48px&height=48px'

const { animeList, loading, updateAnimeList } = useBangumi()

const loadingElement = ref<HTMLElement>()
let intersectionObserver: IntersectionObserver | undefined

onMounted(() => {
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting)
        updateAnimeListWithIntersectionCheck()
    },
  )
  loadingElement.value && intersectionObserver.observe(loadingElement.value)
})
onUnmounted(() => {
  intersectionObserver?.disconnect()
})

function lineClamp(event: MouseEvent) {
  const el = event.target as HTMLElement
  const lineClamp = Array.from(el.classList).find(cls => cls.startsWith('line-clamp-'))?.split('-')[2]
  if (lineClamp) {
    const webkitLineClamp = el.style.getPropertyValue('-webkit-line-clamp') || lineClamp
    el.style.setProperty('-webkit-line-clamp', webkitLineClamp === lineClamp ? 'unset' : lineClamp)
  }
}

async function updateAnimeListWithIntersectionCheck() {
  await updateAnimeList()
  requestAnimationFrame(() => {
    if (loadingElement.value && isInView(loadingElement.value))
      updateAnimeListWithIntersectionCheck()
  })
}

function isInView(el: HTMLElement) {
  const box = el.getBoundingClientRect()
  return box.top < window.innerHeight && box.bottom >= 0
}
</script>

<template>
  <SectionDivider>
    <h1>
      动画列表（<a href="https://bangumi.tv/user/undef_baka" class="text-accent underline" target="_blank" rel="noopener noreferrer">bangumi</a>）
    </h1>
  </SectionDivider>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
    <div
      v-for="anime in animeList" :key="anime.subject.id"
      class="flex items-center card p-3"
    >
      <a class="flex-shrink-0" :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer">
        <img :src="anime.subject.images.medium" :alt="anime.subject.name" class="rounded-lg" width="130" height="182">
      </a>

      <div class="h-full ml-2 flex flex-col justify-between flex-grow text-sm">
        <a
          :href="`https://bgm.tv/subject/${anime.subject.id}`" target="_blank" rel="noopener noreferrer"
          class="text-lg text-accent font-bold hover:underline"
        >
          {{ anime.subject.name_cn || anime.subject.name }}
        </a>

        <div class="cursor-pointer line-clamp-2 text-muted my-2 whitespace-pre-line" @click="lineClamp">
          {{ anime.subject.short_summary }}
        </div>

        <hr>

        <div v-if="anime.comment" class="cursor-pointer line-clamp-3 my-2" @click="lineClamp">
          {{ anime.comment }}
        </div>

        <div>
          <span
            class="inline-block text-2xl leading-none text-transparent bg-clip-text"
            role="img"
            :aria-label="`评分 ${anime.rate} / 10`"
            :style="{
              backgroundImage: `linear-gradient(to right, var(--accent) ${anime.rate * 10}%, var(--border) ${anime.rate * 10}%)`,
            }"
          >
            ★★★★★
          </span>
        </div>
      </div>
    </div>
  </div>
  <div v-if="loading" ref="loadingElement" class="pt-5 flex justify-center">
    <LineMdLoadingLoop class="text-accent" />
  </div>
</template>
