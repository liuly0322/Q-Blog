<script setup lang="ts">
const { isDark, toggleDark } = useDarks()
</script>

<template>
  <div class="mt-6 mx-1.25 text-center card p-4">
    <a class="m-0.5 inline-block" href="/feed.xml" target="_blank">
      <i-carbon:rss class="text-3xl" />
    </a>
    <a class="m-0.5 inline-block" href="https://github.com/liuly0322" target="_blank">
      <i-ant-design:github-filled class="text-3xl" />
    </a>
    <span class="m-0.5 inline-block" @click="toggleDark()">
      <i-carbon:haze-night v-if="isDark" class="text-3xl" />
      <i-carbon:sun v-if="!isDark" class="text-3xl" />
    </span>
    <p>
      Powered by
      <a href="https://github.com/liuly0322/Q-Blog" class="blue-link" target="_blank">Q-Blog</a>
    </p>
  </div>
</template>
