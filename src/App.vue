<script setup lang="ts">
import { homePageTitle, SITE_TITLE, staticPageTitles } from '~/pageMeta'

const route = useRoute()
const router = useRouter()
const { summary } = useSummary()

const title = computed(() => {
  const post = route.params.post
  if (typeof post === 'string') {
    const postTitle = summary.find(postMeta => postMeta.url === post)?.title ?? '404'
    return `${postTitle} | ${SITE_TITLE}`
  }

  const tag = route.params.tag
  if (typeof tag === 'string')
    return `${tag} | ${SITE_TITLE}`

  if (route.meta.homePage)
    return homePageTitle(Number(route.params.page || 1))

  return staticPageTitles[route.path] ?? SITE_TITLE
})

onMounted(() => {
  router.afterEach(() => {
    const menu = document.querySelector<HTMLInputElement>('#sidebar-toggle')
    menu && (menu.checked = false)
  })
  watch(title, value => document.title = value, { immediate: true })
})
</script>

<template>
  <div>
    <Header class="mb-4 h-16" />
    <div class="flex flex-col" style="min-height: calc(100vh - var(--content-top))">
      <div class="flex flex-1">
        <aside id="sidebar" class="aside h-full lg:mr-4">
          <ControlPanel />
          <APlayer song-server="netease" song-id="373425292" />
        </aside>
        <main class="flex-grow min-w-0 text-center">
          <router-view />
        </main>
      </div>
      <CommonFooter />
    </div>
    <label
      id="mdui-overlay"
      for="sidebar-toggle"
      class="fixed z-2 hidden cursor-pointer"
    />
  </div>
</template>
