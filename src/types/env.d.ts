/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="unplugin-icons/types/vue" />

declare module 'frontmatter' {
  export default function frontmatter(content: string): {
    data: Record<string, any>
    content: string
  }
}

declare module 'markdown-it-texmath' {
  import type { PluginWithOptions } from 'markdown-it'

  const plugin: PluginWithOptions
  export default plugin
}

declare module 'vite-plugin-vsharp' {
  export default function vsharp(config: any): any
}
