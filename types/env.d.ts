/// <reference types="vite-plugin-pages/client" />
/// <reference types="vite-plugin-pwa/client" />

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
