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

declare module 'markdown-it-texmath' {
  import type { PluginWithOptions } from 'markdown-it'

  const plugin: PluginWithOptions
  export default plugin
}
