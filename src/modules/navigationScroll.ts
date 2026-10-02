import type { RouterScrollBehavior } from 'vue-router'

interface Position {
  left: number
  top: number
}

let pendingScrollPosition: Position | null

export const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  pendingScrollPosition = null

  if (to.path === '/' && !savedPosition)
    usePage().page.value = 1

  if (to.path.startsWith('/posts/')) {
    pendingScrollPosition = savedPosition
    return false
  }

  if (savedPosition)
    return savedPosition

  if (to.hash)
    return { el: to.hash, behavior: 'smooth' }

  return { left: 0, top: 0 }
}

export function restorePost() {
  const position = pendingScrollPosition
  pendingScrollPosition = null

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
