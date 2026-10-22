import axios from 'axios';

export const api = axios.create();

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token && !config.url.startsWith('/api/user/token/') && config.url !== '/api/user/register/') {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});
