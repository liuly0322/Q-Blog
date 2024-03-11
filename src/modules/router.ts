import type { App } from 'vue'
import routes from 'virtual:generated-pages'
import { createRouter, createWebHistory } from 'vue-router'

const { saveScrollPostion, customScrollBehavior } = useCustomScroll()

export const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior: customScrollBehavior,
})
router.beforeEach(saveScrollPostion)

export default (app: App) => app.use(router)
