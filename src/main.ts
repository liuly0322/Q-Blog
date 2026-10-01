import { createSiteApp } from './app'
import nprogress from './modules/nprogress'

import './styles/reset.css'
import 'virtual:uno:components.css'

import './styles/main.css'
import 'virtual:uno.css'

const root = document.querySelector<HTMLElement>('#app')!
// Reuse the actual SSR body; do not ship it again in an inline JSON payload.
const postBody = root.querySelector<HTMLElement>('[data-post-body]')
const initialPost = root.dataset.post && postBody
  ? { post: root.dataset.post, content: postBody.innerHTML }
  : undefined
const { app, router } = createSiteApp(root.dataset.ssg === 'true', initialPost)
nprogress(router)

router.isReady().then(() => {
  app.mount(root)
  // Enhance the input only after Vue has hydrated its disabled SSR markup.
  void import('./modules/pagefind')
    .then(({ default: pagefind }) => pagefind(router))
    .catch(console.error)
})

void import('./modules/imageZoom')
  .then(({ default: imageZoom }) => imageZoom())
  .catch(console.error)
