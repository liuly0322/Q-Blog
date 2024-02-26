import { registerSW } from 'virtual:pwa-register'

import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
import './styles/main.css'

import 'virtual:windi-utilities.css'
import 'virtual:windi-devtools'

import { useModules } from 'virtual:modules'
import App from './App.vue'

registerSW({ immediate: true })

const app = createApp(App)
useModules(app)
app.mount('#app')
