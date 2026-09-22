import type { InitialPage } from './ssg'
import { renderToString } from 'vue/server-renderer'
import { createSiteApp } from './app'

export async function render(url: string, initialPage: InitialPage) {
  const { app, router } = createSiteApp(initialPage)
  await router.push(url)
  await router.isReady()
  const context: { modules?: Set<string> } = {}
  const html = await renderToString(app, context)
  return { html, modules: [...(context.modules ?? [])] }
}
