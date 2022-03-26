<template>
  <n-layout-header>
    <Header text-gray-700 dark:text-gray-200 />
  </n-layout-header>
  <n-layout style="height: 100vh;" has-sider sider-placement="right">
    <n-layout-content ref="contentRef" :native-scrollbar="false" :content-style="contentStyle">
      <main :class="mainClass">
        <router-view />
      </main>
    </n-layout-content>
    <n-layout-sider
      content-style="padding: 24px;"
      collapse-mode="width"
      :collapsed-width="14"
      :width="320"
      :native-scrollbar="false"
      :default-collapsed="windowWidth < 800"
      :on-after-enter="() => sidebar_hidden = false"
      :on-update:collapsed="on_update"
      show-trigger="arrow-circle"
      bordered
    >
      <Sidebar :hidden="sidebar_hidden" />
    </n-layout-sider>
  </n-layout>
</template>

<script setup lang="ts">
import { LayoutInst } from 'naive-ui'
const windowWidth = ref(window.innerWidth)
const sidebar_hidden = ref(window.innerWidth < 800)
const on_update = (collapsed: boolean) => sidebar_hidden.value = true
const mainClass = (windowWidth.value > 600 ? "px-6 " : "") + "mt-10 pb-10 text-center text-gray-700 dark:text-gray-200"
const contentStyle = (windowWidth.value > 600 ? "padding: 0 24px;" : "") + "min-width: 340px;overflow: hidden;"

const contentRef = ref<LayoutInst | null>(null)
const route = useRoute()
watch(toRef(route, 'path'), (value, oldValue) => {
  if (value !== oldValue)
    contentRef.value?.scrollTo(0, 0)
})
</script>
