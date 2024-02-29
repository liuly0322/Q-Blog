import type { App } from 'vue'
import routes from 'virtual:generated-pages'
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)
      return savedPosition

    return { left: 0, top: 0 }
  },
})

export default (app: App) => app.use(router)
