import { renderToString } from 'vue/server-renderer'
import { createSiteApp } from './app'

export { homePostsCache } from './modules/homePosts'
export { postCache } from './modules/postData'

export async function render(url: string) {
  const { app, router } = createSiteApp(true)
  await router.push(url)
  await router.isReady()
  const context: { modules?: Set<string> } = {}
  const html = await renderToString(app, context)
  return { html, modules: [...(context.modules ?? [])] }
}
