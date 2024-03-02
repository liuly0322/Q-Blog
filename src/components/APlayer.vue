<script lang="ts" setup>
import type { Audio } from 'aplayer-ts'
import APlayer from 'aplayer-ts'
import 'aplayer-ts/dist/APlayer.min.css'

// We do have APlayerOptions type from 'aplayer-ts'
// but vue doesn't support complex type (Omit/extends/...) in defineProps
// see: https://github.com/vuejs/core/issues/8286
const props = withDefaults(defineProps<{
  fixed?: boolean
  mini?: boolean
  autoplay?: boolean
  theme?: string
  loop?: 'all' | 'one' | 'none'
  order?: 'list' | 'random'
  preload?: 'auto' | 'metadata' | 'none'
  volume?: number
  songServer?: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
  songType?: string
  songId: string
  mutex?: boolean
  lrcType?: number
  listFolded?: boolean
  listMaxHeight?: string
  storageName?: string
}>(), {
  fixed: false,
  mini: false,
  autoplay: false,
  theme: 'rgba(255,255,255,0.2)',
  loop: 'all',
  order: 'list',
  preload: 'none',
  volume: 0.7,
  songServer: 'netease',
  songType: 'playlist',
  mutex: true,
  lrcType: 3,
  listFolded: true,
  listMaxHeight: '250px',
  storageName: 'APlayer-setting',
})

const playerRef = ref()
let instance: APlayer

interface Meting {
  artist?: string
  name: string
  url: string
  pic?: string
  lrc?: string
}

async function appendAplayerData() {
  const url = `https://api.liuly.moe/meting-api/?server=${props.songServer}&type=${
    props.songType
  }&id=${props.songId}&r=${Math.random()}`
  const { data }: { data: Ref<Meting[] | null> } = await useFetch(url).get().json()
  const audioList: Audio[] = data.value?.map(
    value => ({
      name: value.name,
      url: value.url,
      artist: value.artist,
      cover: value.pic,
      lrc: value.lrc,
    }),
  ) ?? []
  instance.list.remove(0)
  instance.list.add(audioList)
}

function APlayerInit() {
  const aplayerOptions = { ...props, container: playerRef.value, audio: {
    name: '正在加载...',
    artist: '正在加载...',
  } }
  instance = new APlayer(aplayerOptions)
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
