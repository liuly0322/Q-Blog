import routes from 'virtual:generated-pages'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

const { saveScrollPosition, customScrollBehavior } = useCustomScroll()

export function createSiteRouter() {
  const router = createRouter({
    routes,
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    scrollBehavior: customScrollBehavior,
  })

  router.beforeEach((to) => {
    const path = to.path
      .replace(/^\/index\.html$/i, '/')
      .replace(/\.html$/i, '')

    if (path !== to.path)
      return { path, query: to.query, hash: to.hash, replace: true }
  })

  if (!import.meta.env.SSR)
    router.beforeEach(saveScrollPosition)
  return router
}
