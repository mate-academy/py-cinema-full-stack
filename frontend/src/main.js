import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

Vue.use(VueAxios, axios);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
