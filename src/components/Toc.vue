<!-- https://github.com/txtxj/C-Blog/blob/master/src/components/Toc.vue -->
<!-- License: MIT -->

<script setup lang="ts">
const props = defineProps<{
  items: { id: string, text: string, tab: number }[]
}>()
const activeIds = ref(new Set<string>())
let observer: IntersectionObserver

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        activeIds.value.add(entry.target.id)
      else
        activeIds.value.delete(entry.target.id)
    })
  })

  watch(() => props.items, (items) => {
    observer.disconnect()
    activeIds.value.clear()

    items.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element)
        observer.observe(element)
    })
  }, { immediate: true, flush: 'post' })
})

onUnmounted(() => observer.disconnect())
</script>

<template>
  <nav class="aside <xl:hidden card pl-6 p-4 ml-4 text-left">
    <h2 class="font-medium text-lg mb-4">
      目录
    </h2>
    <ul>
      <li
        v-for="item in items"
        :id="`toc-${item.id}`"
        :key="`toc-${item.id}`"
        class="hover:text-accent pl-[1.5ch]"
        :class="{ 'text-accent': activeIds.has(item.id) }"
        :style="{ 'margin-left': `${item.tab * 1.5}ch` }"
      >
        <RouterLink class="block" :to="`#${item.id}`">
          {{ item.text }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
