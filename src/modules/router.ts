import routes from 'virtual:generated-pages'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { scrollBehavior } from './navigationScroll'
import { loadPostAbstracts } from './postAbstractsData'

export function createSiteRouter() {
  const router = createRouter({
    routes,
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    scrollBehavior,
  })

  router.beforeEach((to) => {
    const path = to.path
      .replace(/^\/index\.html$/i, '/')
      .replace(/\.html$/i, '')

    if (path !== to.path)
      return { path, query: to.query, hash: to.hash, replace: true }
  })

  router.beforeResolve(async (to) => {
    if (to.meta.homePage)
      await loadPostAbstracts(Number(to.params.page || 1))
  })

  return router
}
