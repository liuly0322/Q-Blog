import type { InjectionKey } from 'vue'

export interface InitialPost {
  post: string
  content: string
}

export const initialPostKey: InjectionKey<InitialPost | undefined> = Symbol('initial-post')
