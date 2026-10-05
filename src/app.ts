import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import { createSiteRouter } from './modules/router'

export function createSiteApp(isHydrate = false) {
  const app = isHydrate ? createSSRApp(App) : createApp(App)
  const router = createSiteRouter()
  app.use(router)
  return { app, router }
}
