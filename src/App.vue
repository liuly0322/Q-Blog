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
      <div class="flex-grow min-w-0 text-center">
        <div class="flex flex-col" style="min-height: calc(100vh - 80px)">
          <main class="flex-1">
            <router-view />
          </main>
          <CommonFooter />
        </div>
      </div>
    </div>
    <div
      id="mdui-overlay"
      class="fixed z-2 hidden lg:hidden"
      :class="{ 'mdui-overlay-show': sidebarOpen }"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<style>
@media (max-width: 1023.9px) {
  #sidebar {
    background-color: var(--surface);
    max-height: calc(100vh - 64px) !important;
    position: fixed;
    right: 0;
    top: 64px;
    translate: 100% 0;
    transition: translate 0.3s ease;
    z-index: 3;
  }

  #sidebar.sidebar-open {
    translate: 0 0;
  }

  #mdui-overlay {
    top: 64px;
    left: 0;
    width: 5000px;
    height: 5000px;
    background: rgba(0, 0, 0, 0.4);
    backface-visibility: hidden;
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
