<script setup lang="ts">
import { darkTheme } from 'naive-ui'

// Dark mode
const { isDark, darkOverrides } = useDarks()

// Phone
const { isMobile, phoneNavToggle } = usePhone()
const mainLayoutStyle = computed(() =>
  isMobile.value ? '' : 'height: calc(100vh - var(--header-height) - 1px);',
)
const contentLayoutStyle = computed(() =>
  `padding:0 24px;overflow:hidden;${isMobile.value ? 'min-width:100vw' : ''}`,
)

// Scroll behavior
const contentRef = ref()
useCustomScroll().setContentRef(contentRef)

// HMR
const hotUpdateKey = ref(0)
if (import.meta.hot) {
  import.meta.hot.on('posts-build', () => {
    sessionStorage.clear()
    hotUpdateKey.value++
  })
}
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="isDark ? darkOverrides : null">
    <n-layout-header
      class="relative z-3"
      style="height: var(--header-height);"
    >
      <Header />
    </n-layout-header>
    <n-layout :style="mainLayoutStyle" has-sider sider-placement="right">
      <n-layout-content
        ref="contentRef"
        :native-scrollbar="false"
        :content-style="contentLayoutStyle"
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
        class="z-3"
        style="height: calc(100vh - var(--header-height) - 1px);"
        :collapsed-width="isMobile ? 0 : 14"
        :width="320"
        :native-scrollbar="false"
        :default-collapsed="isMobile"
        show-trigger="arrow-circle"
        bordered
      >
        <Sidebar class="p-6" />
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
