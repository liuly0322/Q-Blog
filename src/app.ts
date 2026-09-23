import type { InitialPost } from './ssg'
import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import { createSiteRouter } from './modules/router'
import { initialPostKey } from './ssg'

export function createSiteApp(isHydrate = false, initialPost?: InitialPost) {
  const app = isHydrate ? createSSRApp(App) : createApp(App)
  const router = createSiteRouter()
  app.provide(initialPostKey, initialPost)
  app.use(router)
  return { app, router }
}
