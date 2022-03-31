<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import Summary from '../assets/summary.json'
import { SummaryKey, PageKey } from '~/types'
const { isDark } = useDarks()

provide(SummaryKey, Summary)
provide(PageKey, ref(1))

const darkOverrides = {
  Layout: {
    color: 'rgb(24, 24, 28)',
  },
}
const theme = computed(() => isDark.value ? darkTheme : undefined)
const Overrides = computed(() => isDark.value ? darkOverrides : undefined)
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="Overrides">
    <router-view />
  </n-config-provider>
</template>
