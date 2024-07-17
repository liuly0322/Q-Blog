<script setup lang="ts">
const PostSearch = defineAsyncComponent(() => import('./PostSearch.vue'))

const { isMobile, phoneNavToggle } = usePhone()
const { navOptions } = useSiteNavigation()
const routePath = useRoute()
</script>

<template>
  <div class="flex items-center justify-between border-b-[0.8px] dark:border-white/9 p-3.5">
    <div class="<sm:flex-grow flex items-center">
      <router-link to="/" class="flex-shrink-0">
        <img
          src="/avatar_192.webp"
          alt="liuly"
          class="rounded-full cursor-pointer"
          height="34"
          width="34"
        >
      </router-link>
      <span class="<sm:hidden pl-2 text-lg flex-shrink-0">llyのblog</span>
    </div>
    <div class="inline-flex items-center">
      <RouterLink
        v-for="option in navOptions"
        :key="option.to"
        class="block mx-3"
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
