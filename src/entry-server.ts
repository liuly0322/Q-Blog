import { renderToString } from 'vue/server-renderer'
import { createSiteApp } from './app'
import { postCache } from './composables/usePostData'

async function renderPage(url: string) {
  const { app, router } = createSiteApp(true)
  await router.push(url)
  await router.isReady()
  const context: { modules?: Set<string> } = {}
  const html = await renderToString(app, context)
  return { html, modules: [...(context.modules ?? [])] }
}

export async function render(url: string, initialPost?: { post: string, content: string }) {
  if (initialPost)
    postCache.set(initialPost.post, initialPost.content)

  try {
    return await renderPage(url)
  }
  finally {
    if (initialPost)
      postCache.delete(initialPost.post)
  }
}
