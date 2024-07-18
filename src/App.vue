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
      <Sidebar id="sidebar" class="min-w-[256px] w-[256px] sticky top-20 <lg:fixed <lg:top-16 <lg:right-[-300px] <lg:z-3 lg:mr-4 h-full duration-300 bg-hex-fff dark:bg-hex-18181c" />
      <main class="flex-grow min-w-0 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div
          class="lg:hidden mdui-overlay"
          @click="() => toggleSidebar()"
        />
      </main>
      <Toc class="min-w-[256px] w-[256px] sticky top-20 <xl:hidden ml-4 h-full overflow-scroll max-h-[80vh]" />
    </div>
  </n-config-provider>
</template>
