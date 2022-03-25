<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import Summary from '../assets/summary.json'
import { SummaryKey } from '~/types'
const { isDark, toggleDark } = useDarks()

provide(SummaryKey, Summary)

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg

const themeOverrides = {}

const darkOverrides = {
  Layout: {
    color: 'rgb(24, 24, 28)',
  },
  // ...
}

const theme = computed(() => isDark.value ? darkTheme : undefined)

const Overrides = computed(() => isDark.value ? darkOverrides : themeOverrides)
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="Overrides">
    <router-view />
  </n-config-provider>
</template>
