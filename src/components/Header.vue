<template>
  <header class="p-2.5">
    <n-card content-style="display:flex;align-items:center;justify-content:space-between">
      <div class="flex items-center">
        <n-avatar
          @click="router.push('/')"
          style="cursor: pointer;"
          round
          :size="48"
          src="https://q2.qlogo.cn/g?b=qq&nk=453026205&s=100"
        />
        <span class="pl-5 text-lg">Life is but code.</span>
      </div>
      <div class="flex">
        <n-menu v-if="!isTablet" mode="horizontal" :options="menuOptions" />
        <n-button text v-if="isTablet" class="mr-2 nav-sider" @click="phoneNavUpdate">
          <i-carbon:menu />
        </n-button>
      </div>
    </n-card>
  </header>
</template>

<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
const router = useRouter()

const { isTablet } = usePhone()

const phoneNavUpdate = () => {
  if (document.querySelector('.n-layout-sider--collapsed')) {
    document.querySelector('.mdui-overlay')?.classList.add('mdui-overlay-show')
    document.documentElement.classList.add('nav-overflow-hidden')
  } else {
    document.querySelector('.mdui-overlay')?.classList.remove('mdui-overlay-show')
    document.documentElement.classList.remove('nav-overflow-hidden')
  }
  (document.querySelector('.n-layout-toggle-button') as HTMLElement).click();
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/',
        },
        { default: () => '主页' },
      ),
    key: 'home',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/archive',
        },
        { default: () => '归档' },
      ),
    key: 'archive',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/tags',
        },
        { default: () => '标签' },
      ),
    key: 'tags',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/links',
        },
        { default: () => '友链' },
      ),
    key: 'links',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/about',
        },
        { default: () => '关于' },
      ),
    key: 'about',
  },
]
</script>
