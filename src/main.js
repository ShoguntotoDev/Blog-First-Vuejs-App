import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import axios from 'axios'

// import './assets/main.css'
import '@/assets/tabler.min.css'
import '@/assets/demo.min.css'
import '@/assets/tabler-vendors.min.css'

axios.defaults.withCredentials = true
axios.defaults.baseURL = 'https://simpledev.one/api'

const app = createApp(App)

app.use(createPinia().use(({store}) => {
    store.$router = markRaw(router)
}))
app.use(router)

app.mount('#app')
