<template>
  <div>
    <n-card v-if="hitokoto.hitokoto" title="一言">
      <span>{{ hitokoto.hitokoto }}</span>
      <n-card :bordered="false" style="text-align:right">
        <span>—— {{ hitokoto.from_who }}「{{ hitokoto.from }}」</span>
      </n-card>
    </n-card>
    <n-card title="我的歌单">
      <a-player song-server="tencent" song-id="2363529455" order="random" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
const hitokoto = ref({ from: '', hitokoto: '', from_who: '' })
const url = 'https://v1.hitokoto.cn'

const getHitokoto = async() => {
  if (localStorage.getItem('last_hitokoto_date') === String(new Date().getDate())) {
    hitokoto.value = JSON.parse(localStorage.getItem('hitokoto_data')!)
    return
  }
  const { error, data } = await useFetch(url).get().json()
  if (!(error.value)) {
    hitokoto.value = data.value
    localStorage.setItem('last_hitokoto_date', String(new Date().getDate()))
    localStorage.setItem('hitokoto_data', JSON.stringify(hitokoto.value))
  }
}

onMounted(getHitokoto)
</script>

<style scoped>
.n-card {
  margin: 0 0 24px 0;
}
</style>
