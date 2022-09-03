<script lang="ts" setup>
import APlayer from 'aplayer-ts'
import 'aplayer-ts/dist/APlayer.min.css'
import type { PropType } from 'vue'

type Status = 'success' | 'error' | 'warning' | undefined

const props = defineProps({
  fixed: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  mini: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  autoplay: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  theme: {
    type: String as PropType<string>,
    default: 'rgba(255,255,255,0.2)',
  },
  loop: {
    type: String as PropType<'all' | 'one' | 'none'>,
    default: 'all',
  },
  order: {
    type: String as PropType<'list' | 'random'>,
    default: 'list',
  },
  preload: {
    type: String as PropType<'auto' | 'metadata' | 'none'>,
    default: 'none',
  },
  volume: {
    type: Number as PropType<number>,
    default: 0.7,
    validator: (value: Number) => {
      return value >= 0 && value <= 1
    },
  },
  songServer: {
    type: String as PropType<
      'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
    >,
    default: 'netease',
  },
  songType: {
    type: String as PropType<string>,
    default: 'playlist',
  },
  songId: {
    type: String as PropType<string>,
    default: '19723756',
  },
  mutex: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  lrcType: {
    type: Number as PropType<number>,
    default: 3,
  },
  listFolded: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  listMaxHeight: {
    type: String as PropType<String>,
    default: '250px',
  },
  storageName: {
    type: String as PropType<string>,
    default: 'APlayer-setting',
  },
})
const playerRef = ref()
const percentage = ref(0)
const loadingStatus = ref(undefined as Status)
let loadingTime = 0
let instance: APlayer

class Audio {
  artist?: string
  name: string
  url: string
  cover?: string
  lrc?: string

  constructor(
    artist: string | undefined,
    name: string,
    url: string,
    cover: string | undefined,
    lrc: string | undefined,
  ) {
    this.artist = artist
    this.name = name
    this.url = url
    this.cover = cover
    this.lrc = lrc
  }
}

interface Meting {
  artist?: string
  name: string
  url: string
  pic?: string
  lrc?: string
}

const fakeLoadingBar = async () => {
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
  const url = `https://api.injahow.cn/meting/?server=${props.songServer}&type=${
    props.songType
  }&id=${props.songId}&r=${Math.random()}`
  const { data, error } = await useFetch(url).get().json()
  if (error.value) {
    loadingStatus.value = 'error'
    percentage.value = 100
  }
  const audioList = (data.value as Array<Meting>).map(
    (value: Meting) =>
      new Audio(value.artist, value.name, value.url, value.pic, value.lrc),
  )
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

// 初始化，nextTick 减少页面渲染等待时间
onMounted(() => nextTick(APlayerInit))
// 销毁
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
