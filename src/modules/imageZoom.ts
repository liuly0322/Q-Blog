import '../styles/image-zoom.css'

export default () => {
  let dialog: HTMLDialogElement | undefined
  let preview: HTMLImageElement
  let previousFocus: HTMLElement | null
  let previousOverflow = ''

  function restore() {
    document.documentElement.style.overflow = previousOverflow
    previousFocus?.focus({ preventScroll: true })
  }

  function createDialog() {
    dialog = document.createElement('dialog')
    dialog.className = 'image-zoom'
    dialog.setAttribute('aria-label', '图片预览')

    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'image-zoom-close'
    close.textContent = '关闭'
    close.autofocus = true
    close.addEventListener('click', () => dialog!.close())

    preview = document.createElement('img')
    dialog.append(close, preview)
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target === preview)
        dialog!.close()
    })
    dialog.addEventListener('close', restore)
    document.body.append(dialog)
  }

  function onClick(event: MouseEvent) {
    const image = event.target
    if (!(image instanceof HTMLImageElement)
      || !image.matches('.md-blog img')
      || image.closest('a, button')
      || event.defaultPrevented
      || event.button !== 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return
    }

    if (!image.complete || !image.naturalWidth)
      return

    if (!dialog)
      createDialog()

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousOverflow = document.documentElement.style.overflow
    preview.src = image.currentSrc || image.src
    preview.alt = image.alt
    dialog!.showModal()
    document.documentElement.style.overflow = 'hidden'
  }

  document.addEventListener('click', onClick)

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      document.removeEventListener('click', onClick)
      if (dialog?.open)
        restore()
      dialog?.remove()
    })
  }
}
