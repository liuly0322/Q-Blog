<template>
  <n-layout-header><Header text-gray-700 dark:text-gray-200 /></n-layout-header>
  <n-layout has-sider sider-placement="right">
    <n-layout-content content-style="padding: 0 24px;">
      <main class="px-6 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
      </main>
    </n-layout-content>
    <n-layout-sider
      content-style="padding: 24px;"
      collapse-mode="width"
      :collapsed-width="14"
      :width="320"
      :native-scrollbar="true"
      :default-collapsed="screen_width_phone"
      :on-after-enter="() => sidebar_hidden=false"
      :on-update:collapsed="on_update"
      show-trigger="arrow-circle"
      bordered
    >
      <Sidebar :hidden="sidebar_hidden" />
    </n-layout-sider>
  </n-layout>
  <n-layout-footer><Footer text-gray-700 dark:text-gray-200 /></n-layout-footer>
</template>

<script setup lang="ts">
const screen_width_phone = ref(window.innerWidth < 800)
const sidebar_hidden = ref(window.innerWidth < 800)
const on_update = (collapsed: boolean) => sidebar_hidden.value = true
</script>

<style scoped>
.n-layout-footer {
  padding: 24px;
}
</style>
