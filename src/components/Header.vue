<script setup lang="ts">
import { RouterLink } from 'vue-router'
const router = useRouter()

const { isMobile, phoneNavToggle } = usePhone()

const menuOptions = [
  {
    label: '主页',
    to: '/',
  },
  {
    label: '归档',
    to: '/archive',
  },
  {
    label: '标签',
    to: '/tags',
  },
  {
    label: '友链',
    to: '/links',
  },
  {
    label: '关于',
    to: '/about',
  },
]
</script>

<template>
  <header class="p-2.5">
    <n-card
      content-style="display:flex;align-items:center;justify-content:space-between"
    >
      <div class="flex items-center">
        <img
          src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100"
          alt="liuly"
          class="rounded-full"
          height="48"
          width="48"
          style="cursor: pointer"
          @click="router.push('/')"
        />
        <span class="pl-5 text-lg">Life is but code.</span>
      </div>
      <div v-if="!isMobile" class="inline-flex">
        <router-link
          v-for="option in menuOptions"
          :key="option.to"
          class="block px-5"
          :to="option.to"
          >{{ option.label }}</router-link
        >
      </div>
      <button v-if="isMobile" class="mr-2 flex" @click="() => phoneNavToggle()">
        <i-carbon:menu />
      </button>
    </n-card>
  </header>
</template>
