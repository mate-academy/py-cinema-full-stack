import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

Vue.use(VueAxios, axios);
Vue.use(VCalendar);


axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

new Vue({
  render: (h) => h(App)
}).$mount('#app');