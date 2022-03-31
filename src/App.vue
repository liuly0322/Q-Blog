<script setup lang="ts">
import { darkTheme } from 'naive-ui'
const { isDark } = useDarks()
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
