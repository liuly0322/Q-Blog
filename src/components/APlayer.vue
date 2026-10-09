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
  <div v-if="!playerReady" class="card flex h-[92px] overflow-hidden pointer-events-none" aria-hidden="true">
    <div class="grid w-[90px] place-items-center bg-inset">
      <span class="text-2xl">♪</span>
    </div>
    <div class="flex flex-1 flex-col justify-between px-2 pt-[10px]">
      <div class="flex flex-col gap-2">
        <span class="h-2 w-[72%] animate-pulse rounded-full bg-line" />
        <span class="h-1 w-[42%] animate-pulse rounded-full bg-line" />
      </div>
      <div class="flex items-center pb-1">
        <div class="flex-1">
          <div class="h-[2px] w-[72%] animate-pulse rounded-full bg-line" />
        </div>
        <div class="text-muted">
          <span>🔈&nbsp;</span>
          <span>☰</span>
        </div>
      </div>
    </div>
  </div>
</template>
