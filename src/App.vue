<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Q-Blog',
  meta: [
    { name: 'description', content: 'liuly 的静态博客' },
  ],
})
</script>

<template>
  <p>modify here?...</p>
  <router-view />
</template>
