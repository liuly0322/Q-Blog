import App from './App.vue'
import nprogress from './modules/nprogress'
import router from './modules/router'

import 'virtual:windi-base.css'
import 'virtual:windi-components.css'

import './styles/main.css'
import 'virtual:windi-utilities.css'
import 'virtual:windi-devtools'

const app = createApp(App)
app.use(router)
app.use(nprogress)
app.mount('#app')
