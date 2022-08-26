<script setup lang="ts">
import { darkTheme } from 'naive-ui'
const { isDark, darkOverrides } = useDarks()

const theme = computed(() => (isDark.value ? darkTheme : undefined))
const overrides = computed(() => (isDark.value ? darkOverrides : undefined))
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="overrides">
    <router-view />
  </n-config-provider>
</template>
