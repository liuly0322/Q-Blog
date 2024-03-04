<script setup lang="ts">
const APlayer = defineAsyncComponent(() => import('./APlayer.vue'))

const { isMobile } = usePhone()
const { mobileNavigation } = useSiteNavigation()
const { isDark, toggleDark } = useDarks()
const { data } = useFetch('https://v1.hitokoto.cn').json()
</script>

<template>
  <div>
    <div v-if="isMobile" class="flex flex-wrap card p-4 mb-6 mx-1.25">
      <router-link v-for="(v, k, i) in mobileNavigation" :key="i" class="mx-3 my-1" :to="v">
        {{ k }}
      </router-link>
    </div>

    <SidebarSearch class="mb-6" />

    <div v-if="!isMobile && data?.hitokoto" class="mb-6 mx-1.25 card p-6">
      <h2 class="font-medium text-lg mb-4">
        一言
      </h2>
      <span>{{ data?.hitokoto }}</span>
      <div class="text-right pt-3.5">
        <span>—— {{ data?.from_who }}「{{ data?.from }}」</span>
      </div>
    </div>

    <APlayer song-server="netease" song-id="373425292" />

    <div class="mt-6 mx-1.25 text-center card p-4">
      <a class="m-0.5 inline-block" href="/feed.xml" target="_blank">
        <i-carbon:rss class="text-3xl" />
      </a>
      <a
        class="m-0.5 inline-block"
        href="https://github.com/liuly0322"
        target="_blank"
      >
        <i-ant-design:github-filled class="text-3xl" />
      </a>
      <span class="m-0.5 inline-block" @click="toggleDark()">
        <i-carbon:haze-night v-if="isDark" class="text-3xl" />
        <i-carbon:sun v-if="!isDark" class="text-3xl" />
      </span>
      <p class="mt-3">
        Copyright © 2021 - 2024 liuly
      </p>
      <p>
        License:
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          class="blue-link"
          target="_blank"
        >CC-BY-NC-SA 4.0</a>
      </p>
      <p>
        Powered by
        <a
          href="https://github.com/liuly0322/Q-Blog"
          class="blue-link"
          target="_blank"
        >Q-Blog</a>
      </p>
    </div>
  </div>
</template>
