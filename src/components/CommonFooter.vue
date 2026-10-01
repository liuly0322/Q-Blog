<script setup lang="ts">
import IconRedHeart from '~icons/fluent-emoji-flat/red-heart'
import { getCurrentSeason, getCurrentYear } from '~/utils/date'

// Prerendered pages ship the compile-time stamp (see vite.config.ts); correct it once mounted.
const footer = ref({ year: __BUILD_YEAR__, season: __BUILD_SEASON__ })
onMounted(() => {
  footer.value = { year: getCurrentYear(), season: getCurrentSeason() }
})
</script>

<template>
  <footer class="flex flex-wrap items-center justify-center pt-8 pb-12 leading-8">
    <div class="flex items-center">
      <span>© 2021 - {{ footer.year }}</span>
      <span class="px-2.5 mt-1 animate-heart-beat animate-duration-1000 animate-count-infinite"><IconRedHeart /></span>
      <span>{{ footer.season }}</span>
      <span class="ml-2">Under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" class="text-accent" target="_blank">CC BY-NC-SA 4.0</a></span>
    </div>
    <div class="flex items-center ml-2">
      <img src="/icp.gov.moe.png" alt="moe-icp" width="16" height="16">
      <a href="https://icp.gov.moe/?keyword=20240322" class="mx-2 text-accent" target="_blank">萌 ICP 备 20240322 号</a>
    </div>
  </footer>
</template>
