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
        class="<lg:fixed <lg:z-3 <lg:right-[-300px] w-[256px] flex-shrink-0 sticky top-20 <lg:top-16 overflow-auto h-full lg:mr-4 duration-300 <lg:bg-hex-fff <lg:dark:bg-hex-1e1e1e"
        :class="{ 'sidebar-open': sidebarOpen }"
        style="max-height: calc(100vh - 80px)"
      />
      <main class="flex-grow min-w-0 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div
          class="lg:hidden mdui-overlay"
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
    max-height: calc(100vh - 64px) !important;
  }
}
</style>
