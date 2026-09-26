<script lang="ts" setup>
import type createPlayer from 'aplayer-ts'

import 'aplayer-ts/src/css/base.css'
import '~/styles/aplayer-dark.css'

const props = withDefaults(defineProps<{
  songServer?: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
  songType?: string
  songId: string
}>(), {
  songServer: 'netease',
  songType: 'playlist',
})

const playerRef = ref()
const playerReady = ref(false)
let instance: ReturnType<typeof createPlayer> | undefined

onMounted(async () => {
  const url = `https://api.liuly.moe/meting-api/?server=${props.songServer}&type=${props.songType}&id=${props.songId}&r=${Math.random()}`
  const [createPlayer, audios] = await Promise.all([
    import('aplayer-ts').then(({ default: createPlayer }) => createPlayer),
    fetch(url).then(response => response.json()),
  ])

  instance = createPlayer()
  instance.init({
    container: playerRef.value,
    theme: 'rgba(255,255,255,0.2)',
    preload: 'none',
    lrcType: 3,
    listFolded: true,
    listMaxHeight: '250px',
    audio: audios,
  })
  playerReady.value = true
})
onBeforeUnmount(() => {
  instance?.destroy()
})
</script>

<template>
  <div ref="playerRef" />
  <div v-if="!playerReady" class="aplayer aplayer-withlrc pointer-events-none" aria-hidden="true">
    <div class="aplayer-pic grid place-items-center bg-gray-100 dark:bg-hex-292929">
      <span class="text-2xl">♪</span>
    </div>

    <div class="aplayer-info">
      <div class="aplayer-music">
        <span class="skeleton h-[7px] w-[72%] bg-gray-200 dark:bg-hex-383838" />
        <span class="skeleton mt-2 h-[5px] w-[42%] bg-gray-100 dark:bg-hex-303030" />
      </div>
      <div class="aplayer-lrc" />
      <div class="aplayer-controller">
        <div class="aplayer-bar-wrap">
          <div class="skeleton h-[2px] w-[72%] bg-gray-200 dark:bg-hex-383838" />
        </div>
        <div class="aplayer-time flex items-center">
          <span class="text-[14px] leading-none mr-1">🔈</span>
          <span class="text-[14px] leading-none">☰</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  display: block;
  border-radius: 9999px;
  background-image: linear-gradient(90deg, transparent 25%, #ffffffcc 50%, transparent 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

html.dark .skeleton {
  background-image: linear-gradient(90deg, transparent 25%, #ffffff1a 50%, transparent 75%);
}

@keyframes skeleton-shimmer {
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
