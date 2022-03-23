<script setup lang="ts">
import { toggleDark } from '~/composables'
</script>

<template>
  <footer>
    <div>
      <a href="https://github.com/liuly0322"><div i-ant-design-github inline-block style="font-size:xx-large" /></a>
      <a @click="toggleDark()"><div i="carbon-sun dark:carbon-moon" inline-block style="font-size:xx-large" /></a>
      <p>
        Copyright © 2021 2022 liuly
      </p>
      <p>License: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" color="blue" target="_blank">CC-BY-NC-SA 4.0</a></p>
      <p>
        Powered by
        <a href="https://github.com/liuly0322/Q-Blog" color="blue" target="_blank" rel="noopener noreferrer">Q-Blog</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  text-align: center;
}
</style>
