<script setup lang="ts">
// Dark mode
const { isDark, darkTheme, darkOverrides } = useDarks()

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
if (import.meta.hot)
  sessionStorage.clear()
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="isDark ? darkOverrides : null">
    <header
      class="relative z-3"
      style="height: var(--header-height);"
    >
      <Header />
    </header>
    <n-layout :style="mainLayoutStyle" has-sider sider-placement="right">
      <n-layout-content
        ref="contentRef"
        :native-scrollbar="false"
        :content-style="contentLayoutStyle"
      >
        <main class="mt-10 pb-10 text-center text-gray-700 dark:text-gray-200">
          <router-view />
          <div
            v-if="isMobile"
            class="mdui-overlay"
            @click="() => phoneNavToggle()"
          />
        </main>
      </n-layout-content>
      <n-layout-sider
        class="z-3"
        style="height: calc(100dvh - var(--header-height) - 1px);"
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
      aria-label="go-top"
      class="z-4 fixed bottom-4 right-4 rounded-full border-solid border-1 w-8 h-8 inline-flex items-center justify-center"
      onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
    >
      <i-carbon:arrow-up />
    </button>
  </n-config-provider>
</template>
