<script setup lang="ts">
const PostSearch = defineAsyncComponent(() => import('./PostSearch.vue'))

const { isMobile, phoneNavToggle } = usePhone()
const { navOptions } = useSiteNavigation()
const routePath = useRoute()
</script>

<template>
  <div class="flex items-center justify-between border-b-[0.8px] dark:border-white/9 p-3.5">
    <router-link to="/" class="flex items-center hover:text-hex-42b883">
      <img
        src="/avatar_192.webp"
        alt="liuly"
        class="rounded-full cursor-pointer"
        height="34"
        width="34"
      >
      <span class="<sm:hidden pl-2 text-lg flex-shrink-0">llyのblog</span>
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
      <button v-if="isMobile" aria-label="menu" class="mx-3 flex" @click="() => phoneNavToggle()">
        <i-carbon:menu />
      </button>
    </div>
  </div>
</template>
