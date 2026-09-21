<script setup lang="ts">
import IconRedHeart from '~icons/fluent-emoji-flat/red-heart'
import { getCurrentSeason, getCurrentYear } from '~/utils/date'
</script>

<template>
  <footer class="flex flex-col items-center justify-center pt-8 pb-12 leading-8 border-t-[0.8px] dark:border-white/9">
    <div class="flex items-center">
      <span>© 2021 - {{ getCurrentYear() }}</span>
      <span class="px-2.5 mt-1 animate-heartBeat animate-infinite"><IconRedHeart /></span>
      <span>{{ getCurrentSeason() }}</span>
    </div>
    <p>
      Under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" class="blue-link" target="_blank">CC BY-NC-SA 4.0</a>
    </p>
    <div class="flex items-center">
      <img src="/icp.gov.moe.png" alt="moe-icp" width="32" height="32">
      <a href="https://icp.gov.moe/?keyword=20240322" class="pl-4 blue-link" target="_blank">萌 ICP 备 20240322 号</a>
    </div>
  </footer>
</template>
