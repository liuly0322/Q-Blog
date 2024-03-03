import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

const { isMobile, phoneNavToggle } = usePhone()

let contentRef: Ref
function setContentRef(ref: Ref) {
  contentRef = ref
}

function isScrollBottom() {
  const errorMargin = 24
  const element = isMobile.value ? document.documentElement : contentRef.value?.scrollbarInstRef.containerRef
  return element.scrollHeight - element.scrollTop <= element.clientHeight + errorMargin
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

export default () => ({ setContentRef, isScrollBottom, saveScrollPostion, getSavedScrollPosition, customScrollBehavior })
