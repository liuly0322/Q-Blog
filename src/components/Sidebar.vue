<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))

const { isMobile } = usePhone()
const { isDark, toggleDark } = useDarks()
const { data } = useFetch('https://v1.hitokoto.cn').json()

const mobileNavigation = {
  '🏠主页': '/',
  '🗃️归档': '/archive',
  '🏷️标签': '/tags',
  '🔗友链': '/links',
  '🧡动画': '/bangumi',
  '❓关于': '/about',
}
</script>

<template>
  <div>
    <div v-if="isMobile" class="flex flex-wrap rounded-lg shadow-md custom-card p-4 mb-6 mx-1.25">
      <router-link v-for="(v, k, i) in mobileNavigation" :key="i" class="mx-3 my-1" :to="v">
        {{ k }}
      </router-link>
    </div>

    <SidebarSearch class="mb-6" />

    <div v-if="!isMobile && data?.hitokoto" class="mb-6 mx-1.25 rounded-lg shadow-md custom-card p-6">
      <h2 class="font-medium text-lg mb-4">
        一言
      </h2>
      <span>{{ data?.hitokoto }}</span>
      <div class="text-right pt-3.5">
        <span>—— {{ data?.from_who }}「{{ data?.from }}」</span>
      </div>
    </div>

    <APlayer song-server="netease" song-id="373425292" />

    <div class="mt-6 mx-1.25 text-center rounded-lg shadow-md custom-card p-4">
      <a class="m-0.5 inline-block" href="/feed.xml" target="_blank">
        <i-carbon:rss style="font-size: xx-large" />
      </a>
      <a
        class="m-0.5 inline-block"
        href="https://github.com/liuly0322"
        target="_blank"
      >
        <i-ant-design:github-filled style="font-size: xx-large" />
      </a>
      <span class="m-0.5 inline-block" @click="toggleDark()">
        <i-carbon:haze-night v-if="isDark" style="font-size: xx-large" />
        <i-carbon:sun v-if="!isDark" style="font-size: xx-large" />
      </span>
      <p class="mt-3">
        Copyright © 2021 - 2024 liuly
      </p>
      <p>
        License:
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          style="color: #258fb8"
          target="_blank"
        >CC-BY-NC-SA 4.0</a>
      </p>
      <p>
        Powered by
        <a
          href="https://github.com/liuly0322/Q-Blog"
          style="color: #258fb8"
          target="_blank"
        >Q-Blog</a>
      </p>
    </div>
  </div>
</template>
