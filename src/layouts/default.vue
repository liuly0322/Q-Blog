<template>
  <n-layout-header><Header text-gray-700 dark:text-gray-200 /></n-layout-header>
  <n-layout has-sider sider-placement="right">
    <n-layout-content content-style="padding: 24px;">
      <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />

        <Counter :initial="10" />
      </main>
    </n-layout-content>
    <n-layout-sider
      content-style="padding: 24px;"
      collapse-mode="width"
      :collapsed-width="14"
      :width="320"
      :native-scrollbar="true"
      :default-collapsed="true"
      show-trigger="arrow-circle"
      bordered
    >
      <Sidebar />
    </n-layout-sider>
  </n-layout>
  <n-layout-footer><Footer text-gray-700 dark:text-gray-200 /></n-layout-footer>
</template>

<style scoped>
.n-layout-footer {
  padding: 24px;
}
</style>
