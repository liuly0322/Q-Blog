interface BrowserMetrics {
  fcp: number
  lcp: number
  cls: number
  article?: number
  content?: number
  contentChars?: number
  hydration?: number
  origin: number
}

interface Element {
  __vue_app__?: unknown
}

interface Window {
  _originalFetch?: typeof fetch
  releaseArticle: () => void
  homePageFetch: {
    requests: number
    complete: boolean
    release: () => void
  }
  bench: BrowserMetrics
  homeBench: BrowserMetrics
  __nprogressCount: number
}

interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean
  value: number
}
