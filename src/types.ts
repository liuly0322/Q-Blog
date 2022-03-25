import type { ViteSSGContext } from 'vite-ssg'
import type { InjectionKey } from 'vue'

export type UserModule = (ctx: ViteSSGContext) => void

interface PostSummary {
  title: string
  date: string
  tags: Array<string>
  url: string
}

export const SummaryKey: InjectionKey<Array<PostSummary>> = Symbol('BlogSummary')
