import type { PagefindModal } from '@pagefind/component-ui'
import type { Router } from 'vue-router'
import { configureInstance } from '@pagefind/component-ui'
import '@pagefind/component-ui/css'
import '../styles/pagefind.css'

export default (router: Router) => {
  const button = document.querySelector<HTMLButtonElement>('#site-search')
  const label = button?.querySelector('[data-search-label]')
  if (!button || !label)
    return

  configureInstance('default', { bundlePath: `${import.meta.env.BASE_URL}pagefind/` })
  const modal = document.createElement('pagefind-modal') as PagefindModal
  modal.id = 'site-search-modal'
  modal.setAttribute('reset-on-close', '')
  document.body.append(modal)

  const events = new AbortController()
  const options = { signal: events.signal }
  const closeForNavigation = () => {
    modal.close()
    button.blur()
  }
  const navigateToResult = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null
    if (!link || event.defaultPrevented || event.button !== 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
      || link.hasAttribute('download') || (link.target && link.target !== '_self')) {
      return
    }
    const url = new URL(link.href)
    if (url.origin !== location.origin || !url.pathname.startsWith(`${import.meta.env.BASE_URL}posts/`))
      return
    event.preventDefault()
    closeForNavigation()
    void router.push(`${url.pathname.replace(/\.html$/, '')}${url.search}${url.hash}`)
  }

  button.addEventListener('click', () => modal.open(), options)
  modal.addEventListener('click', navigateToResult, options)
  const removeBeforeEach = router.beforeEach(closeForNavigation)

  label.textContent = '搜索...'
  button.disabled = false

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      removeBeforeEach()
      events.abort()
      modal.close()
      modal.remove()
      button.disabled = true
      label.textContent = '搜索加载中...'
    })
  }
}
