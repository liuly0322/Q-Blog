<script setup lang="ts">
const props = defineProps<{
  items: { id: string, text: string, tab: number }[]
}>()

const activeId = ref('')
function updateActiveId() {
  activeId.value = props.items.findLast(({ id }) => {
    const element = document.getElementById(id)
    if (!element)
      return false

    const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
    return element.getBoundingClientRect().top <= margin + 1
  })?.id ?? ''
}

onMounted(() => {
  updateActiveId()
  const refreshTimer = window.setInterval(updateActiveId, 100)
  onUnmounted(() => window.clearInterval(refreshTimer))
})

function closeToc() {
  const toggle = document.querySelector<HTMLInputElement>('#toc-toggle')
  toggle && (toggle.checked = false)
}
watch(() => props.items, closeToc)
</script>

<template>
  <input id="toc-toggle" type="checkbox" class="peer fixed bottom-4 right-4 size-px m-0 opacity-0 xl:hidden" aria-label="目录" aria-controls="page-toc">
  <label for="toc-toggle" aria-hidden="true" class="fixed inset-0 z-2 hidden <xl:peer-checked:block cursor-pointer" />
  <label
    for="toc-toggle"
    class="fixed bottom-4 right-4 z-2 xl:hidden card p-4 cursor-pointer hover:text-accent peer-focus-visible:outline"
  >
    <i-carbon:menu class="size-4" aria-hidden="true" />
  </label>
  <nav
    id="page-toc" aria-label="目录"
    class="aside card pl-6 p-4 text-left xl:ml-4 overscroll-contain <xl:hidden <xl:peer-checked:block <xl:fixed <xl:top-auto <xl:bottom-18 <xl:right-4 <xl:z-2 <xl:max-h-[50dvh]"
  >
    <h2 class="font-medium text-lg mb-4">目录</h2>
    <ul class="leading-6">
      <li
        v-for="item in items" :id="`toc-${item.id}`" :key="`toc-${item.id}`"
        class="hover:text-accent" :class="{ 'text-accent': activeId === item.id }"
        :style="{ 'margin-left': `${item.tab * 1.5}ch` }"
      >
        <RouterLink class="block" :to="`#${item.id}`" @click="closeToc">{{ item.text }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>
