import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

const { isMobile, phoneNavToggle } = usePhone()

let contentRef: Ref
function setContentRef(ref: Ref) {
  contentRef = ref
}

interface scrollPosition {
  left: number
  top: number
}

function scroll(position: scrollPosition, phoneNav?: boolean) {
  if (isMobile.value) {
    window.scrollTo(position.left, position.top)
    if (phoneNav !== undefined)
      phoneNavToggle(phoneNav)
  }
  else {
    contentRef.value?.scrollTo(position.left, position.top)
  }
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

function customScrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, position: { left: number, top: number }, isSavedPosition: boolean) {
  // if /posts/..., defer the scroll
  if (to.path.startsWith('/posts/')) {
    deferedScrollPosition = position
    return
  }
  // if homepage and not from go back, reset the page
  if (to.path === '/' && !isSavedPosition)
    page.value = 1
  scroll(position, false)
}

function getScrollPosition(): scrollPosition {
  if (isMobile.value)
    return { left: window.scrollX, top: window.scrollY }
  const element = contentRef.value?.scrollbarInstRef.containerRef
  return { left: element?.scrollLeft ?? 0, top: element?.scrollTop ?? 0 }
}

function saveScrollPostion(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) {
  const position = getScrollPosition()
  sessionStorage.setItem(from.path, JSON.stringify(position))
}

function getSavedScrollPosition(path: string): scrollPosition | null {
  const position = sessionStorage.getItem(path)
  return position ? JSON.parse(position) : null
}

export default () => ({ setContentRef, saveScrollPostion, getSavedScrollPosition, customScrollBehavior, deferScroll })
