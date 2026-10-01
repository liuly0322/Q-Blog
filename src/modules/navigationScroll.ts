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

  if (!position)
    return false

  window.scrollTo(position)
  return true
}
