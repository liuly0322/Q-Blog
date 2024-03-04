<script setup lang="ts">
const { isMobile, phoneNavToggle } = usePhone()
const { navOptions } = useSiteNavigation()
const routePath = useRoute()
</script>

<template>
  <header class="flex items-center justify-between border-b-[0.8px] dark:border-white/9 p-7.5">
    <div class="flex items-center">
      <router-link to="/">
        <img
          src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100"
          alt="liuly"
          class="rounded-full cursor-pointer"
          height="48"
          width="48"
        >
      </router-link>
      <span class="pl-5 text-lg">Life is but code.</span>
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
