<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { isDark } from '~/composables'
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Q-Blog',
  meta: [
    { name: 'description', content: 'liuly 的静态博客' },
  ],
})

const themeOverrides = {
  Layout: {
    footerColor: '#ffffff',
  },
  // ...
}

const darkOverrides = {
  Layout: {
    color: 'rgb(24, 24, 28)',
  },
  // ...
}
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : undefined" :theme-overrides="isDark ? darkOverrides : themeOverrides">
    <router-view />
  </n-config-provider>
</template>
