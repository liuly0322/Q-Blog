import type { App } from 'vue'
import routes from 'virtual:generated-pages'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const { isMobile, phoneNavToggle } = usePhone()

let contentRef: Ref
export function setContentRef(ref: Ref) {
  contentRef = ref
}

const { page } = usePage()
watch(page, () => {
  if (isMobile.value)
    window.scrollTo(0, 0)
  else
    contentRef.value?.scrollTo(0, 0)
})

function customScrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, position: { left: number, top: number }, isSavedPosition: boolean) {
  if (to.path === '/' && !isSavedPosition)
    page.value = 1

  if (isMobile.value) {
    window.scrollTo(position.left, position.top)
    phoneNavToggle(false)
  }
  else {
    contentRef.value?.scrollTo(position.left, position.top)
  }
}

function getScrollPosition() {
  if (isMobile.value)
    return { left: window.scrollX, top: window.scrollY }
  const element = contentRef.value?.scrollbarInstRef.containerRef
  return { left: element?.scrollLeft ?? 0, top: element?.scrollTop ?? 0 }
}

function saveScrollPostion(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) {
  const position = getScrollPosition()
  sessionStorage.setItem(from.path, JSON.stringify(position))
}

function getSavedScrollPosition(path: string) {
  const position = sessionStorage.getItem(path)
  return position ? JSON.parse(position) : null
}

export const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    const isSavedPosition = savedPosition !== null
    if (isSavedPosition)
      savedPosition = getSavedScrollPosition(to.path)
    const position = savedPosition || { left: 0, top: 0 }
    customScrollBehavior(to, from, position, isSavedPosition)
    // disable scroll by router
    return false
  },
})
router.beforeEach(saveScrollPostion)

export default (app: App) => app.use(router)
