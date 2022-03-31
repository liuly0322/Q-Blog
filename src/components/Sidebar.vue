<template>
  <div>
    <sidebar-search></sidebar-search>
    <n-card v-if="hitokoto.hitokoto" title="一言">
      <span>{{ hitokoto.hitokoto }}</span>
      <n-card :bordered="false" style="text-align:right">
        <span>—— {{ hitokoto.from_who }}「{{ hitokoto.from }}」</span>
      </n-card>
    </n-card>
    <n-card title="我的歌单">
      <a-player song-server="tencent" song-id="2363529455" order="random" />
    </n-card>
    <n-card title="关于">
      <div style="text-align: center;" class="about">
        <a href="/feed.xml" target="_blank" style="display: inline-block;">
          <i-carbon:rss style="font-size:xx-large" />
        </a>
        <a href="https://github.com/liuly0322" target="_blank" style="display: inline-block;">
          <i-ant-design:github-filled style="font-size:xx-large" />
        </a>
        <a @click="toggleDark()" style="display: inline-block;">
          <i-carbon:haze-night v-if="isDark" style="font-size:xx-large" />
          <i-carbon:sun v-if="!isDark" style="font-size:xx-large" />
        </a>
        <p style="margin-top: 1em;">Copyright © 2021 2022 liuly</p>
        <p>
          License:
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            style="color: #66ccff;"
            target="_blank"
          >CC-BY-NC-SA 4.0</a>
        </p>
        <p>
          Powered by
          <a
            href="https://github.com/liuly0322/Q-Blog"
            style="color: #66ccff;"
            target="_blank"
            rel="noopener noreferrer"
          >Q-Blog</a>
        </p>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
const { isDark, toggleDark } = useDarks()
const url = 'https://v1.hitokoto.cn'
const { data } = useFetch(url).json()
const hitokoto = computed(() => ({ from: data.value?.from, hitokoto: data.value?.hitokoto, from_who: data.value?.from_who }))
</script>

<style scoped>
.n-card {
  margin: 0 0 24px 0;
}

.about a {
  margin: 0 2px;
}
</style>
