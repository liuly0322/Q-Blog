import type { RouterScrollBehavior } from 'vue-router'

interface Position {
  left: number
  top: number
}

let pendingScrollPosition: Position | undefined

export const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  const position = savedPosition ?? { left: 0, top: 0 }
  pendingScrollPosition = undefined

  if (to.path === '/' && !savedPosition)
    usePage().page.value = 1

  if (to.path.startsWith('/posts/')) {
    pendingScrollPosition = position
    return false
  }

  return position
}

export function restorePost() {
  if (!pendingScrollPosition)
    return

  const position = pendingScrollPosition
  pendingScrollPosition = undefined
  window.scrollTo(position)
}
