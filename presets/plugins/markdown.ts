import { env } from './../shared/env'
import Prism from 'markdown-it-prism'
import anchor from 'markdown-it-anchor'
import Markdown from 'vite-plugin-md'

export const markdownWrapperClasses = env.VITE_APP_MARKDOWN
	? 'md-blog m-auto text-left'
	: ''

export default () => {
	return (
		env.VITE_APP_MARKDOWN &&
		Markdown({
			wrapperClasses: markdownWrapperClasses,
			markdownItSetup(md) {
				md.use(Prism)
				md.use(anchor)
				md.use(require('markdown-it-texmath'), {
					engine: require('katex'),
					delimiters: 'dollars',
					katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
				})
			}
		})
	)
}
