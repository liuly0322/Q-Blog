import type { InjectionKey } from 'vue'

interface PostSummary {
    title: string
    date: string
    tags: Array<string>
    url: string
  }
  
  export const SummaryKey: InjectionKey<Array<PostSummary>> = Symbol('BlogSummary')