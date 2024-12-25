import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';
import './assets/main.css';

// Set the base URL for axios requests
axios.defaults.baseURL = 'http://localhost:8080';  // Change to your backend URL

// Set default authorization header if a token exists in localStorage
const token = localStorage.getItem('access');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

Vue.use(VueAxios, axios);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
