import type { App } from 'vue'
import routes from 'virtual:generated-pages'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

type ScrollFunction = (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, position: { left: number, top: number }, isSavedPosition: boolean) => void
let scrollFunction: ScrollFunction = () => {}
export function setScrollFunction(fn: ScrollFunction) {
  scrollFunction = fn
}

type GetScrollPositionFunction = () => { left: number, top: number }
let getScrollPositionFunction = () => ({ left: 0, top: 0 })
export function setGetScrollPositionFunction(fn: GetScrollPositionFunction) {
  getScrollPositionFunction = fn
}

function savePostion(path: string, position: { left: number, top: number }) {
  sessionStorage.setItem(path, JSON.stringify(position))
}

function getSavedPosition(path: string) {
  const position = sessionStorage.getItem(path)
  return position ? JSON.parse(position) : null
}

export const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    const isSavedPosition = savedPosition !== null
    if (isSavedPosition)
      savedPosition = getSavedPosition(to.path)
    const position = savedPosition || { left: 0, top: 0 }
    scrollFunction(to, from, position, isSavedPosition)
    // disable scroll by router
    return false
  },
})

router.beforeEach((to, from) => {
  const position = getScrollPositionFunction()
  savePostion(from.path, position)
})

export default (app: App) => app.use(router)
