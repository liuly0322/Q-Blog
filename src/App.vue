<script setup lang="ts">
const { isDark, darkTheme, darkOverrides } = useDarks()
const { toggleSidebar } = useMobileSidebar()

// HMR
if (import.meta.hot)
  sessionStorage.clear()
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="isDark ? darkOverrides : null">
    <Header class="mb-4 h-16 box-border" />
    <div class="flex">
      <Sidebar
        id="sidebar"
        class="<lg:fixed <lg:z-3 <lg:right-[-300px] w-[256px] flex-shrink-0 sticky top-20 <lg:top-16 overflow-auto h-full lg:mr-4 duration-300 bg-hex-fff dark:bg-hex-18181c"
        style="max-height: calc(100vh - 80px)"
      />
      <main class="flex-grow min-w-0 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div
          class="lg:hidden mdui-overlay"
          @click="() => toggleSidebar()"
        />
      </main>
      <Toc
        class="<xl:hidden w-[256px] flex-shrink-0 sticky top-20 overflow-auto h-full"
        style="max-height: calc(100vh - 80px)"
      />
    </div>
  </n-config-provider>
</template>

<style>
@media (max-width: 1023.9px) {
  #sidebar {
    max-height: calc(100vh - 64px) !important;
  }
}
</style>
