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
  <header class="sticky top-0 z-3 flex items-center justify-between border-b-[0.8px] p-2" style="background: color-mix(in srgb, var(--surface) 70%, transparent); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px)">
    <router-link to="/" class="flex items-center hover:text-accent">
      <img
        src="/avatar_48.webp"
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
        class="block mx-3 hover:text-accent"
        :class="{ 'text-accent': routePath.path.match(option.match) }"
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
