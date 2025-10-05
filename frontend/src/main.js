import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VCalendar from 'v-calendar';

import './assets/main.css';

// Base da API (usa .env ou fallback)
// Removemos barra final para evitar duplicações em some libs.
const BASE_URL =
  (import.meta.env?.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, '')) ||
  'http://127.0.0.1:8080';

// Cria um instance dedicado do axios
const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // usamos JWT em header, não cookies
});

// ---------- Interceptor de REQUEST ----------
// - Anexa Authorization (Bearer)
// - NÃO força Content-Type quando o body é FormData (deixa o browser setar multipart+boundary)
// - Para JSON, define Content-Type: application/json se ainda não estiver definido
http.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    // MUITO IMPORTANTE: não colocar Content-Type manualmente
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  } else {
    if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  return config;
});

// ---------- Interceptor de RESPONSE ----------
// Tenta renovar o access token ao receber 401, e repete a request original
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};
    if (response && response.status === 401 && !config._retry) {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await http.post('/api/user/token/refresh/', { refresh });
          localStorage.setItem('access', data.access);

          // Marca para evitar loop infinito
          config._retry = true;

          // Atualiza header e reenvia
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${data.access}`;

          // Se o corpo original era FormData, continue sem Content-Type manual
          if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
          }

          return http.request(config);
        } catch (_) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Registra no Vue para usar this.axios nos componentes
Vue.use(VueAxios, http);
Vue.use(VCalendar);

new Vue({
  render: (h) => h(App)
}).$mount('#app');
