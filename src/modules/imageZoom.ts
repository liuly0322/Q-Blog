import '../styles/image-zoom.css'

export default () => {
  let dialog: HTMLDialogElement | undefined
  let preview: HTMLImageElement

  function createDialog() {
    dialog = document.createElement('dialog')
    dialog.className = 'image-zoom'
    dialog.setAttribute('aria-label', '图片预览')

    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'image-zoom-close'
    close.setAttribute('aria-label', '关闭')
    close.title = '关闭'
    close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11"/><path d="m9 9 6 6m0-6-6 6"/></svg>'
    close.autofocus = true

    preview = document.createElement('img')
    dialog.append(close, preview)
    dialog.addEventListener('click', () => dialog!.close())
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

    preview.src = image.currentSrc || image.src
    preview.alt = image.alt
    dialog!.showModal()
  }

  document.addEventListener('click', onClick)

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      document.removeEventListener('click', onClick)
      dialog?.close()
      dialog?.remove()
    })
  }
}
