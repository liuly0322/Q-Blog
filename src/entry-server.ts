import type { InitialPost } from './ssg'
import { renderToString } from 'vue/server-renderer'
import { createSiteApp } from './app'

export async function render(url: string, initialPost?: InitialPost) {
  const { app, router } = createSiteApp(true, initialPost)
  await router.push(url)
  await router.isReady()
  const context: { modules?: Set<string> } = {}
  const html = await renderToString(app, context)
  return { html, modules: [...(context.modules ?? [])] }
}
