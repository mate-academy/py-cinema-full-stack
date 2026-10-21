import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = axios.create({ baseURL });
let refreshRequest = null;

export function clearTokens () {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, async error => {
  const config = error.config;
  const authEndpoint = config?.url?.includes('/api/user/token/');
  if (error.response?.status === 401 && config && !config._retry && !authEndpoint) {
    config._retry = true;
    const refresh = localStorage.getItem('refresh');
    if (refresh && refresh !== 'undefined') {
      try {
        if (!refreshRequest) {
          refreshRequest = axios.post(`${baseURL}/api/user/token/refresh/`, { refresh })
            .then(({ data }) => {
              localStorage.setItem('access', data.access);
              if (data.refresh) localStorage.setItem('refresh', data.refresh);
              return data.access;
            }).finally(() => { refreshRequest = null; });
        }
        await refreshRequest;
        return api(config);
      } catch (_) {
        // An expired refresh token requires a new sign-in.
      }
    }
    clearTokens();
    window.dispatchEvent(new Event('session-expired'));
  }
  const data = error.response?.data;
  const message = typeof data === 'object'
    ? Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}`).join(' · ')
    : 'Could not reach the cinema service. Please try again.';
  window.dispatchEvent(new CustomEvent('api-error', { detail: message }));
  return Promise.reject(error);
});

export default api;
