<script setup lang="ts">
import { RouterLink } from 'vue-router'

const router = useRouter()
const routePath = useRoute()

const { isMobile, phoneNavToggle } = usePhone()

const menuOptions = [
  {
    label: '主页',
    to: '/',
    match: '/$',
  },
  {
    label: '归档',
    to: '/archive',
    match: '/archive$',
  },
  {
    label: '标签',
    to: '/tags',
    match: '/tags',
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
  <header class="p-2.5">
    <div
      class="flex items-center justify-between rounded-lg custom-card px-6 py-5"
    >
      <div class="flex items-center">
        <img
          src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100"
          alt="liuly"
          class="rounded-full cursor-pointer"
          height="48"
          width="48"
          @click="router.push('/')"
        >
        <span class="pl-5 text-lg">Life is but code.</span>
      </div>
      <div v-if="!isMobile" class="inline-flex">
        <RouterLink
          v-for="option in menuOptions"
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
    </div>
  </header>
</template>

<style scoped>
header {
  border-bottom: 0.8px solid #e2e8f0;
}
html.dark header {
  border-bottom: unset;
}
</style>
