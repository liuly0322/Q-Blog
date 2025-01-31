<!-- https://github.com/txtxj/C-Blog/blob/master/src/components/Toc.vue -->
<!-- License: MIT -->

<script setup lang="ts">
const { getToc, enableToc } = useToc()
const elem = getToc()
function scrollIntoView(id: string) {
  const element = document.getElementById(id)!
  const headerOffset = 80
  const offsetPosition = element.offsetTop - headerOffset
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
}
let observer: IntersectionObserver | null = null
let garbage: HTMLElement | null = null
watchEffect(() => {
  observer?.disconnect()
  garbage = null
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id
      const tocItem = document.getElementById(`toc-${id}`)!
      garbage?.classList.remove('text-hex-42b883')
      garbage = null
      if (entry.isIntersecting) {
        tocItem.classList.add('text-hex-42b883')
      }
      else {
        garbage = tocItem
      }
    })
  })
  elem.value.forEach((item) => {
    observer?.observe(document.getElementById(item.id)!)
  })
})
</script>

<template>
  <nav v-show="enableToc" class="card pl-6 p-4 ml-5 mr-1">
    <h2 class="font-medium text-lg mb-4">
      目录
    </h2>
    <ul>
      <li
        v-for="item in elem"
        :id="`toc-${item.id}`"
        :key="`toc-${item.id}`"
        class="hover:underline pl-[1.5ch]"
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
