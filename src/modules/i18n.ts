import { App } from 'vue'
import { createI18n } from 'vue-i18n'

const messages = Object.fromEntries(
	Object.entries(
		import.meta.globEager('../../locales/*.y(a)?ml')
	).map(([key, value]) => {
		const yaml = key.endsWith('.yaml')
		return [key.slice(14, yaml ? -5 : -4), value.default]
	})
)

export default (app: App) => {
	const i18n = createI18n({
		legacy: false,
		locale: 'en',
		messages
	})

	app.use(i18n)
}
