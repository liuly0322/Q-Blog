import { createSiteApp } from './app'
import { postCache } from './composables/usePostData'
import nprogress from './modules/nprogress'

import './styles/reset.css'
import 'virtual:uno:components.css'

import './styles/main.css'
import 'virtual:uno.css'

const root = document.querySelector<HTMLElement>('#app')!
// Reuse the actual SSR body; do not ship it again in an inline JSON payload.
const postBody = root.querySelector<HTMLElement>('[data-post-body]')
if (root.dataset.post && postBody)
  postCache.set(root.dataset.post, postBody.innerHTML)

const { app, router } = createSiteApp(root.dataset.ssg === 'true')

router.isReady().then(() => {
  // Nprogress should not be enabled until the initial route is loaded.
  nprogress(router)
  app.mount(root)
  // Enhance the input only after Vue has hydrated its disabled SSR markup.
  void import('./modules/pagefind')
    .then(({ default: pagefind }) => pagefind(router))
    .catch(console.error)
})

void import('./modules/imageZoom')
  .then(({ default: imageZoom }) => imageZoom())
  .catch(console.error)
