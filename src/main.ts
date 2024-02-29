import { registerSW } from 'virtual:pwa-register'

import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
import './styles/main.css'

import 'virtual:windi-utilities.css'
import 'virtual:windi-devtools'

import App from './App.vue'
import router from './modules/router'
import nprogress from './modules/nprogress'

registerSW({ immediate: true })

const app = createApp(App)
app.use(router)
app.use(nprogress)
app.mount('#app')
