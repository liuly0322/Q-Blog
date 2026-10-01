import type { PagefindModal } from '@pagefind/component-ui'
import type { Router } from 'vue-router'
import { configureInstance } from '@pagefind/component-ui'
import '@pagefind/component-ui/css'
import '../styles/pagefind.css'

export default (router: Router) => {
  const input = document.querySelector<HTMLInputElement>('#site-search')
  if (!input)
    return

  configureInstance('default', { bundlePath: `${import.meta.env.BASE_URL}pagefind/` })
  const modal = document.createElement('pagefind-modal') as PagefindModal
  modal.id = 'site-search-modal'
  modal.setAttribute('reset-on-close', '')
  document.body.append(modal)

  const events = new AbortController()
  const options = { signal: events.signal }
  let restoringFocus = false
  let restoreFocusOnClose = true
  const open = () => {
    if (restoringFocus)
      return
    restoreFocusOnClose = true
    // Let our close handler restore focus without reopening the modal.
    input.blur()
    modal.open()
  }
  const restoreFocus = () => {
    if (!restoreFocusOnClose) {
      input.blur()
      return
    }
    restoringFocus = true
    input.focus({ preventScroll: true })
    restoringFocus = false
  }
  const closeForNavigation = () => {
    // The native close event is queued, so keep focus restoration disabled until
    // the next explicit open, even when navigation finishes before that event.
    restoreFocusOnClose = false
    modal.close()
    input.blur()
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

  input.addEventListener('focus', open, options)
  input.addEventListener('click', open, options)
  input.form?.addEventListener('submit', (event) => {
    event.preventDefault()
    open()
  }, options)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open()
    }
  }, options)
  // Capture also handles dialog replacements made by the official components.
  modal.addEventListener('close', restoreFocus, { ...options, capture: true })
  modal.addEventListener('click', navigateToResult, options)
  const removeAfterEach = router.afterEach((to, from, failure) => {
    if (!failure && to.fullPath !== from.fullPath)
      closeForNavigation()
  })

  input.placeholder = '搜索...'
  input.disabled = false

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      removeAfterEach()
      events.abort()
      modal.close()
      modal.remove()
      input.disabled = true
      input.placeholder = '搜索加载中...'
    })
  }
}
