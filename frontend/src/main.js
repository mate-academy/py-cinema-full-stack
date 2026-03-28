import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VCalendar from 'v-calendar'
import 'v-calendar/dist/style.css'
import './assets/main.css'

// Налаштування базової URL з .env
axios.defaults.baseURL = import.meta.env.VITE_API_URL

// Додаємо JWT токен до кожного запиту автоматично
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const app = createApp(App)

app.use(router)
app.use(VueAxios, axios)
app.use(VCalendar, {})

app.mount('#app')
