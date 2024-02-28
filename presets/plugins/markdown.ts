import Prism from 'markdown-it-prism'
import anchor from 'markdown-it-anchor'
import texmath from 'markdown-it-texmath'
import Markdown from 'vite-plugin-md'
import katex from 'katex'
import { env } from './../shared/env'

export const markdownWrapperClasses = env.VITE_APP_MARKDOWN
  ? 'md-blog m-auto text-left'
  : ''

export default () => {
  return (
    env.VITE_APP_MARKDOWN
    && Markdown({
      wrapperClasses: markdownWrapperClasses,
      markdownItSetup(md) {
        md.use(Prism)
        md.use(anchor)
        md.use(texmath, {
          engine: katex,
          delimiters: 'dollars',
          katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
        })
      },
    })
  )
}
