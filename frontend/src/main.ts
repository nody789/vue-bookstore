// main.ts — Vue 應用程式啟動入口，依序掛載 Pinia、Router、Head 後渲染到 #app
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)
// createHead 讓 useHead() composable 在所有元件內可用，統一管理 <head> 標籤
const head = createHead()
app.use(createPinia())
app.use(router)
app.use(head)
app.mount('#app')
