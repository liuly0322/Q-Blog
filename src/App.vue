<script setup lang="ts">
import { SITE_TITLE, staticPageTitles } from '~/pageMeta'

const sidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()
const { summary } = useSummary()

onMounted(() => {
  router.afterEach(() => {
    sidebarOpen.value = false
  })
})

const title = computed(() => {
  const post = route.params.post
  if (typeof post === 'string') {
    const postTitle = summary.find(postMeta => postMeta.url === post)?.title ?? '404'
    return `${postTitle} | ${SITE_TITLE}`
  }

  const tag = route.params.tag
  if (typeof tag === 'string')
    return `${tag} | ${SITE_TITLE}`

  return staticPageTitles[route.path] ?? SITE_TITLE
})

onMounted(() => {
  watch(title, value => document.title = value, { immediate: true })
})

// HMR
if (import.meta.hot)
  sessionStorage.clear()
</script>

<template>
  <div>
    <Header class="mb-4 h-16 box-border" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex">
      <Sidebar
        id="sidebar"
        class="w-[256px] flex-shrink-0 sticky top-20 overflow-auto h-full lg:mr-4"
        :class="{ 'sidebar-open': sidebarOpen }"
        style="max-height: calc(100vh - 80px)"
      />
      <main class="flex-grow min-w-0 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div
          id="mdui-overlay"
          class="lg:hidden"
          :class="{ 'mdui-overlay-show': sidebarOpen }"
          @click="sidebarOpen = false"
        />
      </main>
    </div>
  </div>
</template>

<style>
@media (max-width: 1023.9px) {
  #sidebar {
    background-color: #fff;
    max-height: calc(100vh - 64px) !important;
    position: fixed;
    right: 0;
    top: 64px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 3;
  }

  html.dark #sidebar {
    background-color: #1e1e1e;
  }

  #sidebar.sidebar-open {
    transform: translateX(0);
  }

  #mdui-overlay {
    position: fixed;
    top: 64px;
    left: 0;
    width: 5000px;
    height: 5000px;
    z-index: 2;
    background: rgba(0, 0, 0, 0.4);
    backface-visibility: hidden;
    display: none;
    opacity: 0;
    transition-duration: 0.3s;
    transition-property: opacity, visibility;
    will-change: opacity;
  }

  #mdui-overlay.mdui-overlay-show {
    display: unset;
    opacity: 1;
  }
}
</style>
