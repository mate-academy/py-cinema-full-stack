import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access') || localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

Vue.use(VueAxios, axios);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
