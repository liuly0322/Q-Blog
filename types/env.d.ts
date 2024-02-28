declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import type { ComponentOptions } from 'vue'

  const Component: ComponentOptions
  export default Component
}

declare module 'frontmatter' {
  export default function frontmatter(content: string): {
    data: Record<string, any>
    content: string
  }
}

declare module 'rss' {
  export default class RSS {
    constructor(options: { title: string, description: string, feed_url: string, site_url: string, copyright: string, language: string })
    item(options: { title: string, description: string, url: string, date: string }): void
    xml(): string
  }
}

declare module 'katex' {
  export function renderToString(tex: string, options?: { displayMode?: boolean }): string
}

declare module 'markdown-it-texmath' {
  import type { PluginWithOptions } from 'markdown-it'

  const plugin: PluginWithOptions
  export default plugin
}
