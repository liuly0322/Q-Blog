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
  let minTag = '9'
  for (const e of titleElements) {
    if (minTag > e.tagName[1])
      minTag = e.tagName[1]
  }
  for (const e of titleElements) {
    tocElements.value.push({
      id: e.id,
      text: e.textContent ?? '',
      tab: Number.parseInt(e.tagName[1]) - Number.parseInt(minTag),
    })
  }
}

function getToc() {
  return tocElements
}

export default () => ({ setToc, getToc, enableToc })
