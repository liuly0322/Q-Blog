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

<script lang="ts" setup>
import APlayer from 'aplayer-ts'
import 'aplayer-ts/dist/APlayer.min.css'
import type { PropType } from '@vue/runtime-core'

type Status = 'success' | 'error' | 'warning' | undefined

const playerRef = ref()
const percentage = ref(0)
const loadingTime = ref(0)
const loadingStatus = ref(undefined as Status)
let instance: APlayer

class Audio {
  // 音频艺术家
  artist?: String
  // 音频名称
  name: String
  // 音频链接
  url: String
  // 音频封面
  cover?: String
  // 歌词
  lrc?: String

  constructor(artist: String|undefined, name: String, url: String, cover: String|undefined, lrc: String|undefined) {
    this.artist = artist
    this.name = name
    this.url = url
    this.cover = cover
    this.lrc = lrc
  }
}

const props = defineProps({
  // 开启吸底模式
  fixed: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  // 开启迷你模式
  mini: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  // 音频自动播放
  autoplay: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
  // 主题色
  theme: {
    type: String as PropType<string>,
    default: 'rgba(255,255,255,0.2)',
  },
  // 音频循环播放
  loop: {
    type: String as PropType<'all' | 'one' | 'none'>,
    default: 'all',
  },
  // 音频循环顺序
  order: {
    type: String as PropType<'list' | 'random'>,
    default: 'list',
  },
  // 预加载
  preload: {
    type: String as PropType<'auto' | 'metadata' | 'none'>,
    default: 'auto',
  },
  // 默认音量
  volume: {
    type: Number as PropType<number>,
    default: 0.7,
    validator: (value: Number) => {
      return value >= 0 && value <= 1
    },
  },
  // 歌曲服务器(netease-网易云, tencent-qq音乐, kugou-酷狗, xiami-小米音乐, baidu-百度音乐)
  songServer: {
    type: String as PropType<'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'>,
    default: 'netease',
  },
  // 播放类型(song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家)
  songType: {
    type: String as PropType<string>,
    default: 'playlist',
  },
  // 歌的id
  songId: {
    type: String as PropType<string>,
    default: '19723756',
  },
  // 互斥，阻止多个播放器同时播放，当前播放器播放时暂停其他播放器
  mutex: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  // 传递歌词方式
  lrcType: {
    type: Number as PropType<number>,
    default: 3,
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  // 列表最大高度
  listMaxHeight: {
    type: String as PropType<String>,
    default: '250px',
  },
  // 存储播放器设置的 localStorage key
  storageName: {
    type: String as PropType<string>,
    default: 'APlayer-setting',
  },
})

interface Meting {
  author?: String
  title: String
  url: String
  pic?: String
  lrc?: String
}

const fakeLoadingBar = async() => {
  const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms))
  while (true) {
    await sleep(200)
    loadingTime.value += 200
    percentage.value += Math.random() * 20
    if (percentage.value > 80)
      break
  }
  while (loadingStatus.value !== 'error' && loadingStatus.value !== 'success') {
    await sleep(200)
    loadingTime.value += 200
    if (loadingTime.value > 2000) {
      loadingStatus.value = 'warning'
      return
    }
  }
}

const APlayerInit = async function() {
  fakeLoadingBar()
  const url = `https://api.i-meto.com/meting/api?server=${props.songServer}&type=${props.songType}&id=${props.songId}&r=${Math.random()}`
  const { data, error } = await useFetch(url).get().json()
  if (error.value) {
    loadingStatus.value = 'error'
    percentage.value = 100
  }
  const audioList = (data.value as Array<Meting>).map((value: Meting) => new Audio(value.author, value.title, value.url, value.pic, value.lrc))
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

// 初始化
onMounted(() => nextTick(APlayerInit))
// 销毁
onBeforeUnmount(() => {
  instance.destroy()
})
</script>
