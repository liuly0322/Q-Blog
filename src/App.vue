<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import Summary from '../assets/summary.json'
import { SummaryKey } from '~/types'
const { isDark, toggleDark } = useDarks()

provide(SummaryKey, Summary)
provide('page', ref(1))

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
