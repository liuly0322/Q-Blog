<script setup lang="ts">
const { isDark, toggleDark } = useDarks()

const { isMobile } = usePhone()
const router = useRouter()

const { data } = useFetch('https://v1.hitokoto.cn').json()
const hitokoto = computed(() => ({
  from: data.value?.from,
  hitokoto: data.value?.hitokoto,
  from_who: data.value?.from_who,
}))

const mobileNavigation = {
  '🏠主页': '/',
  '🗃️归档': '/archive',
  '🏷️标签': '/tags',
  '🔗友链': '/links',
  '🧡微博': '/microblog',
  '❓关于': '/about',
}
</script>

<template>
  <div>
    <n-card v-if="isMobile" content-style="display: flex; flex-wrap:wrap" class="mb-6">
      <span v-for="(v, k, i) in mobileNavigation" :key="i" class="mx-3 my-1" @click="router.push(v)">{{ k }}</span>
    </n-card>

    <SidebarSearch class="mb-6" />

    <n-card v-if="!isMobile && hitokoto.hitokoto" title="一言" class="mb-6">
      <span>{{ hitokoto.hitokoto }}</span>
      <div class="text-right pt-3.5">
        <span>—— {{ hitokoto.from_who }}「{{ hitokoto.from }}」</span>
      </div>
    </n-card>

    <APlayer song-server="netease" song-id="373425292" order="random" />

    <n-card class="mt-6 text-center">
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
        Copyright © 2021 - 2023 liuly
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
    </n-card>
  </div>
</template>
