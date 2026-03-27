import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VCalendar from 'v-calendar'
import 'v-calendar/dist/style.css'
import './assets/main.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

const app = createApp(App)

app.use(router)
app.use(VueAxios, axios)
app.use(VCalendar, {})

app.mount('#app')
