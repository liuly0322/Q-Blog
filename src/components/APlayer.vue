<script lang="ts" setup>
import type { Audio } from 'aplayer-ts'
import APlayer from 'aplayer-ts'
import 'aplayer-ts/dist/APlayer.min.css'

const props = withDefaults(defineProps<{
  fixed: boolean
  mini: boolean
  autoplay: boolean
  theme: string
  loop: 'all' | 'one' | 'none'
  order: 'list' | 'random'
  preload: 'auto' | 'metadata' | 'none'
  volume: number
  songServer: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
  songType: string
  songId: string
  mutex: boolean
  lrcType: number
  listFolded: boolean
  listMaxHeight: string
  storageName: string
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

type Status = 'success' | 'error' | 'warning' | undefined
const loadingStatus: Ref<Status> = ref(undefined)
const percentage = ref(0)
let loadingTime = 0
let instance: APlayer

interface Meting {
  artist?: string
  name: string
  url: string
  pic?: string
  lrc?: string
}

async function fakeLoadingBar() {
  const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))
  while (percentage.value <= 80) {
    await sleep(200)
    loadingTime += 200
    percentage.value += Math.random() * 20
  }
  while (loadingStatus.value !== 'error' && loadingStatus.value !== 'success') {
    if (loadingTime > 2000) {
      loadingStatus.value = 'warning'
      return
    }
    await sleep(200)
    loadingTime += 200
  }
}

const APlayerInit = async function () {
  fakeLoadingBar()
  const url = `https://api.liuly.moe/meting-api/?server=${props.songServer}&type=${
    props.songType
  }&id=${props.songId}&r=${Math.random()}`
  const { data, error }: { data: Ref<Meting[] | null>, error: Ref<any> } = await useFetch(url).get().json()
  if (error.value) {
    loadingStatus.value = 'error'
    percentage.value = 100
  }
  const audioList: Audio[] = data.value?.map(
    value => ({
      name: value.name,
      url: value.url,
      artist: value.artist,
      cover: value.pic,
      lrc: value.lrc,
    }),
  ) ?? []
  instance = new APlayer({
    container: playerRef.value,
    fixed: props.fixed,
    mini: props.mini,
    autoplay: props.autoplay,
    theme: props.theme,
    loop: props.loop,
    order: props.order,
    preload: props.preload,
    volume: props.volume,
    mutex: props.mutex,
    lrcType: props.lrcType,
    listFolded: props.listFolded,
    listMaxHeight: props.listMaxHeight,
    storageName: props.storageName,
    audio: audioList,
  })
  loadingStatus.value = 'success'
}

onMounted(() => nextTick(APlayerInit))
onBeforeUnmount(() => {
  instance.destroy()
})
</script>

<template>
  <div ref="playerRef" />
  <n-progress
    v-if="loadingStatus !== 'success'"
    type="line"
    :status="loadingStatus"
    :percentage="percentage"
    :show-indicator="false"
  />
</template>
