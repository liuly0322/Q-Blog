<script setup lang="ts">
const route = useRoute()

const navOptions = [
  { label: '主页', to: '/' },
  { label: '友链', to: '/links' },
  { label: '动画', to: '/bangumi' },
  { label: '关于', to: '/about' },
]
</script>

<template>
  <header class="sticky top-0 z-3 flex items-center justify-between border-b-[0.8px] p-4" style="background: color-mix(in srgb, var(--surface) 70%, transparent); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px)">
    <router-link to="/" class="flex items-center hover:text-accent">
      <img
        src="/avatar_192.webp"
        alt="liuly"
        class="rounded-full cursor-pointer"
        height="48"
        width="48"
      >
      <span class="<sm:hidden pl-2 text-lg">llyのblog</span>
    </router-link>
    <div class="flex items-center gap-4">
      <RouterLink
        v-for="option in navOptions"
        :key="option.to"
        class="block hover:text-accent"
        :class="{ 'text-accent': route.path === option.to }"
        :to="option.to"
      >
        {{ option.label }}
      </RouterLink>
      <label for="sidebar-toggle" class="lg:hidden relative cursor-pointer">
        <input
          id="sidebar-toggle"
          type="checkbox"
          aria-label="menu"
          aria-controls="sidebar"
          class="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer peer"
        >
        <i-carbon:menu class="peer-focus-visible:outline" />
      </label>
    </div>
  </header>
</template>
