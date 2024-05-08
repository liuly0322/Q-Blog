<script lang="ts" setup>
import APlayer from 'aplayer-ts'
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
const instance = APlayer()
const url = `https://api.liuly.moe/meting-api/?server=${props.songServer}&type=${props.songType}&id=${props.songId}&r=${Math.random()}`
const audios = await fetch(url).then(response => response.json())

function APlayerInit() {
  instance.init({
    container: playerRef.value,
    theme: 'rgba(255,255,255,0.2)',
    preload: 'none',
    lrcType: 3,
    listFolded: true,
    listMaxHeight: '250px',
    audio: audios,
  })
}

onMounted(APlayerInit)
onBeforeUnmount(() => {
  instance.destroy()
})
</script>

<template>
  <div ref="playerRef" />
</template>
