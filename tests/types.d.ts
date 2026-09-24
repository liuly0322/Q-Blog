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
  bench: BrowserMetrics
  homeBench: BrowserMetrics
}

interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean
  value: number
}
