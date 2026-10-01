<script setup lang="ts">
const emit = defineEmits(['toggleSidebar'])
const routePath = useRoute()

const navOptions = [
  {
    label: '主页',
    to: '/',
    match: '/$',
  },
  {
    label: '友链',
    to: '/links',
    match: '/links$',
  },
  {
    label: '动画',
    to: '/bangumi',
    match: '/bangumi$',
  },
  {
    label: '关于',
    to: '/about',
    match: '/about$',
  },
]
</script>

<template>
  <header class="sticky top-0 bg-white/70 dark:bg-hex-1e1e1e/70 z-3 flex items-center justify-between border-b-[0.8px] dark:border-white/9 p-2" style="-webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px)">
    <router-link to="/" class="flex items-center hover:text-hex-42b883">
      <img
        src="/avatar_192.webp"
        alt="liuly"
        class="rounded-full cursor-pointer"
        height="48"
        width="48"
      >
      <span class="<sm:hidden pl-2 text-lg">llyのblog</span>
    </router-link>
    <div class="inline-flex items-center">
      <RouterLink
        v-for="option in navOptions"
        :key="option.to"
        class="block mx-3 hover:text-hex-42b883"
        :class="{ 'text-hex-42b883': routePath.path.match(option.match) }"
        :to="option.to"
      >
        {{ option.label }}
      </RouterLink>
      <button aria-label="menu" class="lg:hidden mx-3 flex" @click="emit('toggleSidebar')">
        <i-carbon:menu />
      </button>
    </div>
  </header>
</template>
