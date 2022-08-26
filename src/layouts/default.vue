<script setup lang="ts">
import { LayoutInst } from 'naive-ui'
const { isMobile, phoneNavToggle } = usePhone()
const mainLayoutStyle = computed(() =>
  isMobile.value ? '' : 'height: calc(100vh - var(--header-height));'
)
const siderWidth = computed(() => (isMobile.value ? 0 : 14))

const contentRef = ref<LayoutInst | null>(null)
const routePath = toRef(useRoute(), 'path')
const { page } = usePage()
watch([routePath, page], () => {
  if (isMobile.value) {
    window.scrollTo(0, 0)
    phoneNavToggle(false)
  } else {
    contentRef.value?.scrollTo(0, 0)
  }
})
</script>

<template>
  <n-layout-header
    style="
      height: calc(var(--header-height) - 1px);
      position: relative;
      z-index: 3;
    "
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
        <div
          v-if="isMobile"
          class="mdui-overlay"
          @click="() => phoneNavToggle()"
        ></div>
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
  <n-button
    v-if="isMobile"
    circle
    class="z-4 fixed bottom-4 right-4"
    onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
  >
    <i-carbon:arrow-up />
  </n-button>
</template>

<style scoped>
.n-layout-sider {
  z-index: 3;
  height: calc(100vh - var(--header-height));
}
</style>
