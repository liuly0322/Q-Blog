<script setup lang="ts">
const { isMobile, phoneNavToggle } = usePhone()
const { navOptions } = useSiteNavigation()
const routePath = useRoute()
</script>

<template>
  <header class="flex items-center justify-between border-b-[0.8px] dark:border-white/9 p-3.5">
    <div class="<sm:flex-grow flex items-center">
      <router-link to="/" class="flex-shrink-0">
        <img
          src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100"
          alt="liuly"
          class="rounded-full cursor-pointer"
          height="32"
          width="32"
        >
      </router-link>
      <span class="<sm:hidden pl-2 text-lg flex-shrink-0">llyのblog</span>
      <PostSearch class="px-4" />
    </div>
    <div v-if="!isMobile" class="inline-flex">
      <RouterLink
        v-for="option in navOptions"
        :key="option.to"
        class="block px-5"
        :style="routePath.path.match(option.match) ? 'color: #42b883' : ''"
        :to="option.to"
      >
        {{ option.label }}
      </RouterLink>
    </div>
    <button v-if="isMobile" class="mr-2 flex" @click="() => phoneNavToggle()">
      <i-carbon:menu />
    </button>
  </header>
</template>
