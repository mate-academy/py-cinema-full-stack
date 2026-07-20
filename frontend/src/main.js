import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

axios.defaults.baseURL = 'http://localhost:8000';
axios.interceptors.request.use((config) => {
  if (!config.url.endsWith('/')) {
    config.url += '/';
  }
  return config;
});

Vue.use(VueAxios, axios);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
