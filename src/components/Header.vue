<script setup lang="ts">
const { toggleSidebar } = useMobileSidebar()
const { navOptions } = useSiteNavigation()
const routePath = useRoute()
</script>

<template>
  <header class="sticky top-0 backdrop-filter backdrop-blur bg-hex-fff dark:bg-hex-18181c bg-opacity-70 z-3 flex items-center justify-between border-b-[0.8px] dark:border-white/9 p-2">
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
        :style="routePath.path.match(option.match) ? 'color: #42b883' : ''"
        :to="option.to"
      >
        {{ option.label }}
      </RouterLink>
      <button aria-label="menu" class="lg:hidden mx-3 flex" @click="() => toggleSidebar()">
        <i-carbon:menu />
      </button>
    </div>
  </header>
</template>
