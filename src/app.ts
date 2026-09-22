import type { InitialPage } from './ssg'
import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import { createSiteRouter } from './modules/router'
import { initialPageKey } from './ssg'

export function createSiteApp(initialPage?: InitialPage) {
  const app = initialPage ? createSSRApp(App) : createApp(App)
  const router = createSiteRouter()
  app.provide(initialPageKey, initialPage)
  app.use(router)
  return { app, router }
}
