import routes from 'virtual:generated-pages'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

const { saveScrollPosition, customScrollBehavior } = useCustomScroll()

export function createSiteRouter() {
  const router = createRouter({
    routes,
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    scrollBehavior: customScrollBehavior,
  })
  if (!import.meta.env.SSR)
    router.beforeEach(saveScrollPosition)
  return router
}
