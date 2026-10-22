import Vue from 'vue';
import App from './App.vue';
import { api } from './api';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

Vue.use(VueAxios, api);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
