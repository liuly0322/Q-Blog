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
        <Comment v-if="commentEnable" repo="liuly0322/liuly0322.github.io" issue-term="pathname" />
        <div v-if="isMobile" class="mdui-overlay" @click="() => phoneNavToggle()"></div>
      </main>
    </n-layout-content>
    <n-layout-sider
      content-style="padding: 24px;"
      collapse-mode="width"
      :collapsed-width="14"
      :width="320"
      :native-scrollbar="false"
      :default-collapsed="isMobile"
      :on-after-enter="() => sidebarHidden = false"
      :on-update:collapsed="onUpdate"
      show-trigger="arrow-circle"
      bordered
    >
      <Sidebar :hidden="sidebarHidden" />
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

<script setup lang="ts">
import { LayoutInst } from 'naive-ui'
const { isMobile, phoneNavToggle } = usePhone()
const sidebarHidden = ref(isMobile.value)
const mainLayoutStyle = computed(() => isMobile.value ? '' : 'height: calc(100vh - var(--header-height));')
const onUpdate = (collapsed: boolean) => sidebarHidden.value = true

const contentRef = ref<LayoutInst | null>(null)
const routePath = toRef(useRoute(), 'path')
const commentEnable = ref(routePath.value.includes('posts'))
watch(routePath, (value, oldValue) => {
  if (value !== oldValue) {
    if (isMobile.value) {
      phoneNavToggle(false)           // 关闭导航栏
    } else {
      contentRef.value?.scrollTo(0, 0)
    }
    (async () => {
      commentEnable.value = false     // first disable
      await nextTick()                // ensure refresh
      commentEnable.value = value.includes('posts')
    })()
  }
})

const { page } = usePage()
watch(page, (value, oldValue) => {
  if (value !== oldValue) {
    if (isMobile.value) {
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
</style>