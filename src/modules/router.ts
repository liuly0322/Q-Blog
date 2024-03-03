import type { App } from 'vue'
import routes from 'virtual:generated-pages'
import { createRouter, createWebHistory } from 'vue-router'

const { saveScrollPostion, getSavedScrollPosition, customScrollBehavior } = useCustomScroll()

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
