<!-- https://github.com/txtxj/C-Blog/blob/master/src/components/Toc.vue -->
<!-- License: MIT -->

<script setup lang="ts">
defineProps<{
  items: { id: string, text: string, tab: number, active: boolean }[]
}>()
function scrollIntoView(id: string) {
  const element = document.getElementById(id)!
  const headerOffset = 80
  const offsetPosition = element.offsetTop - headerOffset
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
}
</script>

<template>
  <nav class="card pl-6 p-4 ml-5 mr-1">
    <h2 class="font-medium text-lg mb-4">
      目录
    </h2>
    <ul>
      <li
        v-for="item in items"
        :id="`toc-${item.id}`"
        :key="`toc-${item.id}`"
        class="hover:underline pl-[1.5ch]"
        :class="{ 'text-hex-42b883': item.active }"
        :style="{ 'margin-left': `${item.tab * 1.5}ch` }"
        @click="scrollIntoView(item.id)"
      >
        {{ item.text }}
      </li>
    </ul>
  </nav>
</template>

<style scoped>
ul > li:hover::before {
  content: '>';
  position: relative;
  float: left;
  left: -1.5ch;
  width: 0;
  height: 0;
}
</style>
