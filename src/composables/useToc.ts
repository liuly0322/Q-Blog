// https://github.com/txtxj/C-Blog/blob/master/src/composables/useToc.ts
// MIT License

interface TocElement {
  id: string
  text: string
  tab: number
}

const tocElements: Ref<TocElement[]> = ref([])

const enableToc = ref(false)

function setToc(element: HTMLElement) {
  const titleElements: HTMLElement[] = Array.from(element.querySelectorAll('h2,h3,h4'))
  enableToc.value = titleElements.length > 0
  enableToc.value && updateToc(titleElements)
}

function updateToc(titleElements: HTMLElement[]) {
  tocElements.value = []
  // Find minimum header level more efficiently
  let minTag = 9
  for (const e of titleElements) {
    const level = Number(e.tagName[1])
    if (level < minTag)
      minTag = level
  }
  // Build TOC with tab offset
  for (const e of titleElements) {
    tocElements.value.push({
      id: e.id,
      text: e.textContent ?? '',
      tab: Number(e.tagName[1]) - minTag - 1,
    })
  }
}

function getToc() {
  return tocElements
}

export default () => ({ setToc, getToc, enableToc })
