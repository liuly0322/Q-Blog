<script setup lang="ts">
import { SITE_TITLE, staticPageTitles } from '~/pageMeta'

const sidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()
const { summary } = useSummary()

router.afterEach(() => {
  sidebarOpen.value = false
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
</script>

<template>
  <div>
    <Header class="mb-4 h-16 box-border" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex flex-col" style="min-height: calc(100vh - var(--content-top))">
      <div class="flex flex-1">
        <Sidebar
          id="sidebar"
          class="aside h-full lg:mr-4"
          :class="{ 'sidebar-open': sidebarOpen }"
        />
        <main class="flex-grow min-w-0 text-center">
          <router-view />
        </main>
      </div>
      <CommonFooter />
    </div>
    <div
      id="mdui-overlay"
      class="fixed z-2 hidden lg:hidden"
      :class="{ 'mdui-overlay-show': sidebarOpen }"
      @click="sidebarOpen = false"
    />
  </div>
</template>
