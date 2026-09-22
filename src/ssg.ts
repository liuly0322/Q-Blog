import type { InjectionKey } from 'vue'

export interface InitialPage {
  post: string
  content: string
}

export const initialPageKey: InjectionKey<InitialPage | undefined> = Symbol('initial-page')
