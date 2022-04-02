<template>
  <n-layout-header
    style="height: calc(var(--header-height) - 1px); position: relative; z-index: 3;"
  >
    <Header text-gray-700 dark:text-gray-200 />
  </n-layout-header>
  <n-layout :style="mainLayoutStyle" has-sider sider-placement="right">
    <n-layout-content
      ref="contentRef"
      :native-scrollbar="false"
      content-style="padding: 0 24px;min-width: 340px;overflow: hidden;"
    >
      <main class="mt-10 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div class="mdui-overlay" onclick="document.querySelector('.nav-sider').click()"></div>
      </main>
    </n-layout-content>
    <n-layout-sider
      content-style="padding: 24px;"
      collapse-mode="width"
      :collapsed-width="14"
      :width="320"
      :native-scrollbar="false"
      :default-collapsed="width < 800"
      :on-after-enter="() => sidebarHidden = false"
      :on-update:collapsed="onUpdate"
      show-trigger="arrow-circle"
      bordered
    >
      <Sidebar :hidden="sidebarHidden" />
    </n-layout-sider>
  </n-layout>
  <n-button
    v-if="isTablet"
    circle
    class="go-top"
    onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
  >
    <i-carbon:arrow-up />
  </n-button>
</template>

<script setup lang="ts">
import { LayoutInst } from 'naive-ui'
const { width, isTablet } = usePhone()
const sidebarHidden = ref(width.value < 800)
const mainLayoutStyle = computed(() => isTablet.value ? '' : 'height: calc(100vh - var(--header-height));')
const onUpdate = (collapsed: boolean) => sidebarHidden.value = true

const contentRef = ref<LayoutInst | null>(null)
const route = useRoute()
watch(toRef(route, 'path'), (value, oldValue) => {
  if (value !== oldValue) {
    if (!isTablet.value) {
      contentRef.value?.scrollTo(0, 0)
    }
  }
})

const { page } = usePage()
watch(page, (value, oldValue) => {
  if (value !== oldValue) {
    if (isTablet.value) {
      window.scrollTo(0, 0)
    } else {
      contentRef.value?.scrollTo(0, 0)
    }
  }
})
</script>

<style scoped>
.n-layout-sider {
  z-index: 3;
  height: calc(100vh - var(--header-height));
}

.go-top {
  position: fixed;
  bottom: 1em;
  right: 1em;
  z-index: 4;
}
</style>