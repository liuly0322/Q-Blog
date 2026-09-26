<script setup lang="ts">
import { SITE_TITLE, staticPageTitles } from '~/pageMeta'

const { toggleSidebar } = useMobileSidebar()

const route = useRoute()
const { summary } = useSummary()

useTitle(computed(() => {
  const post = route.params.post
  if (typeof post === 'string') {
    const title = summary.find(postMeta => postMeta.url === post)?.title ?? '404'
    return `${title} | ${SITE_TITLE}`
  }

  const tag = route.params.tag
  if (typeof tag === 'string')
    return `${tag} | ${SITE_TITLE}`

  return staticPageTitles[route.path] ?? SITE_TITLE
}))

// HMR
if (import.meta.hot)
  sessionStorage.clear()
</script>

<template>
  <div>
    <Header class="mb-4 h-16 box-border" />
    <div class="flex">
      <Sidebar
        id="sidebar"
        class="<lg:fixed <lg:z-3 <lg:right-[-300px] w-[256px] flex-shrink-0 sticky top-20 <lg:top-16 overflow-auto h-full lg:mr-4 duration-300 <lg:bg-hex-fff <lg:dark:bg-hex-1e1e1e"
        style="max-height: calc(100vh - 80px)"
      />
      <main class="flex-grow min-w-0 pb-10 text-center text-gray-700 dark:text-gray-200">
        <router-view />
        <div
          class="lg:hidden mdui-overlay"
          @click="() => toggleSidebar()"
        />
      </main>
      <Toc
        class="<xl:hidden w-[256px] flex-shrink-0 sticky top-20 overflow-auto h-full"
        style="max-height: calc(100vh - 80px)"
      />
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
