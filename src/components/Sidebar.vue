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

<template>
  <div>
    <n-card v-if="isTablet" title="导航" content-style="display: flex; flex-wrap:wrap" class="mb-6">
      <span class="mx-3 my-1" @click="phoneNav('/')">🏠主页</span>
      <span class="mx-3 my-1" @click="phoneNav('/archive')">🗃️归档</span>
      <span class="mx-3 my-1" @click="phoneNav('/tags')">🏷️标签</span>
      <span class="mx-3 my-1" @click="phoneNav('/links')">🔗友链</span>
      <span class="mx-3 my-1" @click="phoneNav('/about')">❓关于</span>
    </n-card>
    <SidebarSearch class="mb-6" />
    <n-card v-if="hitokoto.hitokoto" title="一言" class="mb-6">
      <span>{{ hitokoto.hitokoto }}</span>
      <div class="text-right pt-3.5">
        <span>—— {{ hitokoto.from_who }}「{{ hitokoto.from }}」</span>
      </div>
    </n-card>
    <n-card title="我的歌单" class="mb-6">
      <APlayer song-server="tencent" song-id="2363529455" order="random" />
    </n-card>
    <n-card title="关于" class="mb-6">
      <div style="text-align: center;" class="about">
        <a class="m-0.5 inline-block" href="/feed.xml" target="_blank">
          <i-carbon:rss style="font-size:xx-large" />
        </a>
        <a class="m-0.5 inline-block" href="https://github.com/liuly0322" target="_blank">
          <i-ant-design:github-filled style="font-size:xx-large" />
        </a>
        <span class="m-0.5 inline-block" @click="toggleDark()">
          <i-carbon:haze-night v-if="isDark" style="font-size:xx-large" />
          <i-carbon:sun v-if="!isDark" style="font-size:xx-large" />
        </span>
        <p class="mt-3">Copyright © 2021 2022 liuly</p>
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
