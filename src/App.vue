<script setup lang="ts">
// Dark mode
const { isDark, darkTheme, darkOverrides } = useDarks()

// Phone
const { phoneNavToggle } = usePhone()

// HMR
if (import.meta.hot)
  sessionStorage.clear()
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="isDark ? darkOverrides : null">
    <Header />
    <div class="flex">
      <Sidebar id="sidebar" class="<lg:fixed <lg:right-[-300px] <lg:h-full <lg:z-3 lg:mr-4 duration-300 bg-hex-fff dark:bg-hex-18181c" />
      <main class="flex-grow w-full mt-6 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div
          class="lg:hidden mdui-overlay"
          @click="() => phoneNavToggle()"
        />
      </main>
    </div>
  </n-config-provider>
</template>
