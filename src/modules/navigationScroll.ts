import type { RouterScrollBehavior } from 'vue-router'
import { START_LOCATION } from 'vue-router'

interface Position {
  left: number
  top: number
}

let pendingScrollPosition: Position | null | undefined

export const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  if (from === START_LOCATION && !savedPosition)
    return false

  if (to.path === '/' && !savedPosition)
    usePage().page.value = 1

  if (to.path.startsWith('/posts/')) {
    pendingScrollPosition = savedPosition
    return to.path !== from.path ? { left: 0, top: 0 } : false
  }

  if (savedPosition)
    return savedPosition

  if (to.hash) {
    const target = document.getElementById(to.hash.slice(1))
    const margin = target ? Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0
    return { el: to.hash, top: margin, behavior: 'smooth' }
  }

  return { left: 0, top: 0 }
}

export function restorePost() {
  const position = pendingScrollPosition

  if (position === undefined)
    return

  if (position) {
    window.scrollTo(position)
    return
  }

  if (window.location.hash) {
    try {
      const heading = document.getElementById(window.location.hash.slice(1))
      if (!heading)
        return

      const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
      window.scrollTo({
        top: window.scrollY + heading.getBoundingClientRect().top - margin,
        behavior: 'smooth',
      })
    }
    catch { /* Ignore malformed URL fragments. */ }
  }
}
