<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import type { LayoutInst } from 'naive-ui'
import { setGetScrollPositionFunction, setScrollFunction } from './modules/router'

const { isDark, darkOverrides } = useDarks()
const theme = computed(() => (isDark.value ? darkTheme : undefined))
const overrides = computed(() => (isDark.value ? darkOverrides : undefined))

const { isMobile, phoneNavToggle } = usePhone()
const mainLayoutStyle = computed(() =>
  isMobile.value ? '' : 'height: calc(100vh - var(--header-height));',
)
const sidebarLayoutStyle = computed(() =>
  `padding:0 24px;overflow:hidden;${isMobile.value ? 'min-width:100vw' : ''}`,
)
const siderWidth = computed(() => (isMobile.value ? 0 : 14))

const contentRef = ref<LayoutInst | null>(null)
const { page } = usePage()
watch(page, () => {
  if (isMobile.value)
    window.scrollTo(0, 0)
  else
    contentRef.value?.scrollTo(0, 0)
})
setGetScrollPositionFunction(() => {
  if (isMobile.value)
    return { left: window.scrollX, top: window.scrollY }
  const element = document.querySelector('.n-layout-content .n-scrollbar-container')
  return { left: element?.scrollLeft ?? 0, top: element?.scrollTop ?? 0 }
})
setScrollFunction((to, from, position, isSavedPosition) => {
  if (to.path === '/' && !isSavedPosition)
    page.value = 1

  if (isMobile.value) {
    window.scrollTo(position.left, position.top)
    phoneNavToggle(false)
  } else {
    contentRef.value?.scrollTo(position.left, position.top)
  }
})

const hotUpdateKey = ref(0)
if (import.meta.hot) {
  import.meta.hot.on('posts-build', () => {
    hotUpdateKey.value++
  })
}
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="overrides">
    <n-layout-header
      style="
      height: calc(var(--header-height) - 1px);
      position: relative;
      z-index: 3;
    "
    >
      <Header />
    </n-layout-header>
    <n-layout :style="mainLayoutStyle" has-sider sider-placement="right">
      <n-layout-content
        ref="contentRef"
        :native-scrollbar="false"
        :content-style="sidebarLayoutStyle"
      >
        <main class="mt-10 pb-10 text-center text-gray-700 dark:text-gray-200">
          <router-view :key="hotUpdateKey" />
          <div
            v-if="isMobile"
            class="mdui-overlay"
            @click="() => phoneNavToggle()"
          />
        </main>
      </n-layout-content>
      <n-layout-sider
        content-style="padding: 24px;"
        :collapsed-width="siderWidth"
        :width="320"
        :native-scrollbar="false"
        :default-collapsed="isMobile"
        show-trigger="arrow-circle"
        bordered
      >
        <Sidebar />
      </n-layout-sider>
    </n-layout>
    <button
      v-if="isMobile"
      class="z-4 fixed bottom-4 right-4 rounded-full border-solid border-1 w-8 h-8 inline-flex items-center justify-center"
      onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
    >
      <i-carbon:arrow-up />
    </button>
  </n-config-provider>
</template>

<style scoped>
.n-layout-sider {
  z-index: 3;
  height: calc(100vh - var(--header-height));
}
</style>
