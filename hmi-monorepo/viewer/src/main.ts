import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import App from './App.vue'
import './index.css'

const app  = createApp(App)
app.use(createPinia()).use(naive).mount('#app')
