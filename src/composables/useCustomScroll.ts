import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

const { closeSidebar } = useMobileSidebar()

interface scrollPosition {
  left: number
  top: number
}

function scroll(position: scrollPosition) {
  window.scrollTo(position)
}

const { page } = usePage()
watch(page, () => {
  scroll({ left: 0, top: 0 })
})

let deferedScrollPosition: scrollPosition = { left: 0, top: 0 }

function deferScroll() {
  scroll(deferedScrollPosition)
  deferedScrollPosition = { left: 0, top: 0 }
}

function setDeferScroll(path: string, position: scrollPosition): boolean {
  if (path.startsWith('/posts/')) {
    deferedScrollPosition = position
    return true
  }
  return false
}

function resetIndexPageNumber(path: string, isSavedPosition: boolean) {
  if (path === '/' && !isSavedPosition)
    page.value = 1
}

function customScrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, savedPosition: scrollPosition | null): false {
  const isSavedPosition = savedPosition !== null
  const position = getSavedScrollPosition(to.path, isSavedPosition)
  resetIndexPageNumber(to.path, isSavedPosition)
  setDeferScroll(to.path, position) || scroll(position) || closeSidebar()
  return false
}

function getScrollPosition(): scrollPosition {
  return { left: window.scrollX, top: window.scrollY }
}

function saveScrollPosition(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) {
  const position = getScrollPosition()
  sessionStorage.setItem(from.path, JSON.stringify(position))
}

function getSavedScrollPosition(path: string, enable: boolean): scrollPosition {
  if (!enable)
    return { left: 0, top: 0 }
  const position = sessionStorage.getItem(path)
  return position ? JSON.parse(position) : { left: 0, top: 0 }
}

export default () => ({ saveScrollPosition, customScrollBehavior, scroll, deferScroll })
