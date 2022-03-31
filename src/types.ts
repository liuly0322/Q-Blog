import type { InjectionKey, Ref } from 'vue'

export interface PostSummary {
    title: string
    date: string
    tags: Array<string>
    url: string
  }
  
export const SummaryKey: InjectionKey<Array<PostSummary>> = Symbol('BlogSummary')

export const PageKey: InjectionKey<Ref<number>> = Symbol('Page')