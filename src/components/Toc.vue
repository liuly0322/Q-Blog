<!-- https://github.com/txtxj/C-Blog/blob/master/src/components/Toc.vue -->
<!-- License: MIT -->

<script setup lang="ts">
const { getToc } = useToc()
const elem = getToc()
function scrollIntoView(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="mb-6 mx-1.25 card p-6">
    <h2 class="font-medium text-lg mb-4">
      目录
    </h2>
    <ul>
      <li
        v-for="(item, index) in elem"
        :id="`toc-${index}`"
        :key="`toc-${item.id}`"
        class="hover:underline text-hex-42b883 pl-[1.5ch]"
        :style="{ 'margin-left': `${item.tab * 1.5}ch` }"
        @click="scrollIntoView(item.id)"
      >
        {{ item.text }}
      </li>
    </ul>
  </div>
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
