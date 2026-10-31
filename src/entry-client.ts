import { createSiteApp } from './app'
import { setSummary } from './composables/useSummary'
import nprogress from './modules/nprogress'
import { postAbstractsCache } from './modules/postAbstractsData'
import { postCache } from './modules/postData'

import './styles/main.css'
import 'virtual:uno.css'

const root = document.querySelector<HTMLElement>('#app')!

const postBody = root.querySelector<HTMLElement>('[data-post-body]')
if (postBody)
  postCache.set(root.dataset.post!, postBody.innerHTML)

const homePage = root.querySelector<HTMLElement>('[data-home-page]')
if (homePage) {
  postAbstractsCache.set(Number(homePage.dataset.homePage), Array.from(root.querySelectorAll('.md-blog-home'), excerpt => excerpt.innerHTML))
}

const { app, router } = createSiteApp(root.dataset.ssg === 'true')

Promise.all([router.isReady(), window.blogSummaryFuture]).then(([, { posts }]) => {
  setSummary(posts)
  // Nprogress should not be enabled until the initial route is loaded.
  nprogress(router)
  app.mount(root)
  // Enable the search button only after Vue has hydrated its disabled SSR markup.
  void import('./modules/pagefind')
    .then(({ default: pagefind }) => pagefind(router))
    .catch(console.error)
})

void import('./modules/imageZoom')
  .then(({ default: imageZoom }) => imageZoom())
  .catch(console.error)
