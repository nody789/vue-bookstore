// main.ts — Vue 應用程式啟動入口，依序掛載 Pinia、Router 後渲染到 #app
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
