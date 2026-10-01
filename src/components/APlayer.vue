<script lang="ts" setup>
import type createPlayer from 'aplayer-ts'

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
  const [createPlayer, , audios] = await Promise.all([
    import('aplayer-ts').then(({ default: createPlayer }) => createPlayer),
    import('~/styles/aplayer-theme.css'),
    fetch(url).then(response => response.json()),
  ])

  instance = createPlayer()
  instance.init({
    container: playerRef.value,
    theme: 'var(--accent)',
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
  <div v-if="!playerReady" class="card m-1 overflow-hidden pointer-events-none" aria-hidden="true">
    <div class="player-pic float-left grid place-items-center bg-inset">
      <span class="text-2xl">♪</span>
    </div>

    <div class="player-info box-border">
      <div class="player-music">
        <span class="skeleton block rounded-full h-[7px] w-[72%]" />
        <span class="skeleton block rounded-full mt-2 h-[5px] w-[42%]" />
      </div>
      <div class="player-lrc" />
      <div class="flex">
        <div class="player-bar flex-1">
          <div class="skeleton block rounded-full h-[2px] w-[72%]" />
        </div>
        <div class="player-time relative flex items-center">
          <span class="text-[14px] leading-none mr-1">🔈</span>
          <span class="text-[14px] leading-none">☰</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-pic {
  width: 90px;
  height: 90px;
}

.player-info {
  margin-left: 90px;
  height: 90px;
  padding: 10px 7px 0;
}

.player-music {
  height: 22px;
  margin: 0 0 13px 5px;
}

.player-lrc {
  height: 30px;
  margin: -10px 0 7px;
}

.player-bar {
  margin-left: 5px;
  padding: 4px 0;
}

.player-time {
  bottom: 4px;
  height: 17px;
  padding-left: 7px;
  color: var(--muted);
}

.skeleton {
  background-image: linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
