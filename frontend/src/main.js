import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
axios.defaults.headers.common['Content-Type'] = 'application/json';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

Vue.use(VueAxios, axios);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
