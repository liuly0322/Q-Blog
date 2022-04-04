<template>
  <div>
    <n-card v-if="isTablet" title="导航" content-style="display: flex; flex-wrap:wrap">
      <span class="nav-item" @click="phoneNav('/')">🏠主页</span>
      <span class="nav-item" @click="phoneNav('/archive')">🗃️归档</span>
      <span class="nav-item" @click="phoneNav('/tags')">🏷️标签</span>
      <span class="nav-item" @click="phoneNav('/links')">🔗友链</span>
      <span class="nav-item" @click="phoneNav('/about')">❓关于</span>
    </n-card>
    <SidebarSearch />
    <n-card v-if="hitokoto.hitokoto" title="一言">
      <span>{{ hitokoto.hitokoto }}</span>
      <n-card :bordered="false" style="text-align:right">
        <span>—— {{ hitokoto.from_who }}「{{ hitokoto.from }}」</span>
      </n-card>
    </n-card>
    <n-card title="我的歌单">
      <APlayer song-server="tencent" song-id="2363529455" order="random" />
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

const { isTablet } = usePhone()
const router = useRouter()
const phoneNav = (path: string) => {
  (document.querySelector('.nav-sider') as HTMLElement).click()
  router.push(path)
}

const { data } = useFetch('https://v1.hitokoto.cn').json()
const hitokoto = computed(() => ({ from: data.value?.from, hitokoto: data.value?.hitokoto, from_who: data.value?.from_who }))
</script>

<style scoped>
.n-card {
  margin: 0 0 24px 0;
}

.about a {
  margin: 0 2px;
}

.nav-item {
  margin: 4px 1em;
}
</style>
