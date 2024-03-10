<script lang="ts" setup>
import APlayer, { addMusicPlugin, clearMusicPlugin } from 'aplayer-ts'
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
const instance = APlayer().use(addMusicPlugin).use(clearMusicPlugin)

interface Meting {
  artist?: string
  name: string
  url: string
  pic?: string
  lrc?: string
}

async function appendAplayerData() {
  const url = `https://api.liuly.moe/meting-api/?server=${props.songServer}&type=${props.songType}&id=${props.songId}&r=${Math.random()}`
  const { data }: { data: Ref<Meting[] | null> } = await useFetch(url).get().json()
  const audioList = data.value?.map(value => ({ ...value, cover: value.pic })) ?? []
  instance.list.clear()
  instance.list.add(audioList)
}

function APlayerInit() {
  instance.init({
    container: playerRef.value,
    theme: 'rgba(255,255,255,0.2)',
    preload: 'none',
    lrcType: 3,
    listFolded: true,
    listMaxHeight: '250px',
    audio: {
      name: '正在加载...',
      artist: '正在加载...',
      lrc: 'data:,loading...',
    },
  })
  appendAplayerData()
}

onMounted(APlayerInit)
onBeforeUnmount(() => {
  instance.destroy()
})
</script>

<template>
  <div ref="playerRef" />
</template>
