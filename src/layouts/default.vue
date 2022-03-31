<template>
  <n-layout-header style="height: calc(var(--header-height) - 1px)">
    <Header text-gray-700 dark:text-gray-200 />
  </n-layout-header>
  <n-layout class="main-layout" has-sider sider-placement="right">
    <n-layout-content
      ref="contentRef"
      :native-scrollbar="false"
      content-style="padding: 0 24px;min-width: 340px;overflow: hidden;"
    >
      <main class="mt-10 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
      </main>
    </n-layout-content>
    <n-layout-sider
      content-style="padding: 24px;"
      collapse-mode="width"
      :collapsed-width="14"
      :width="320"
      :native-scrollbar="false"
      :default-collapsed="width < 800"
      :on-after-enter="() => sidebar_hidden = false"
      :on-update:collapsed="on_update"
      show-trigger="arrow-circle"
      bordered
    >
      <Sidebar :hidden="sidebar_hidden" />
    </n-layout-sider>
  </n-layout>
  <n-button circle class="go-top" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">
    <i-carbon:arrow-up />
  </n-button>
</template>

<script setup lang="ts">
import { LayoutInst } from 'naive-ui'
const width = window.innerWidth
const sidebar_hidden = ref(width < 800)
const on_update = (collapsed: boolean) => sidebar_hidden.value = true

const contentRef = ref<LayoutInst | null>(null)
const route = useRoute()

watch(toRef(route, 'path'), (value, oldValue) => {
  if (value !== oldValue) {
    if (window.innerWidth >= 450) {
      contentRef.value?.scrollTo(0, 0)
    }
  }
})

const nowPage = usePage()
watch(nowPage, (value, oldValue) => {
  if (value !== oldValue) {
    if (window.innerWidth >= 450) {
      contentRef.value?.scrollTo(0, 0)
    } else {
      window.scrollTo(0, 0);
    }
  }
})
</script>

<style scoped>
@media screen and (max-width: 449px) {
  .main-layout {
    height: unset;
  }
  .go-top {
    position: fixed;
    bottom: 1em;
    right: 1em;
    z-index: 1;
  }
}

@media screen and (min-width: 450px) {
  .main-layout {
    height: calc(100vh - var(--header-height));
  }
  .go-top {
    display: none;
  }
}
</style>