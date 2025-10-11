// frontend/src/api.js
import axios from "axios";

/**
 * BASE_URL vem do .env (VITE_API_URL). Se não houver, usa 127.0.0.1:8080.
 * Ex.: VITE_API_URL=http://127.0.0.1:8080
 */
export const BASE_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  "http://127.0.0.1:8080";

/**
 * Instância Axios central para toda a app.
 * A base é `${BASE_URL}/api/` para casar com o backend Django.
 */
const api = axios.create({
  baseURL: `${BASE_URL}/api/`,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor: anexa JWT (se existir) no header Authorization.
 * Espera tokens no localStorage: 'access' e 'refresh'.
 */
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

/* ============================================================
 * Funções nomeadas usadas pelas views (.vue)
 * ============================================================
 * Mantém nomes esperados:
 *   - login
 *   - fetchMe
 *   - refreshToken
 *   - fetchMovies
 *   - fetchMovieSessions
 *   - fetchCinemaHalls
 */

// Auth — seu USERNAME_FIELD é "email": enviar { email, password }
export async function login(payload) {
  const password = payload?.password || "";
  const email =
    payload?.email ??
    payload?.login ??   // alguns formulários usam "login" para o e-mail
    payload?.Login ??
    "";

  const { data } = await api.post("user/token/", { email, password });
  return data; // { access, refresh }
}

export async function fetchMe() {
  const { data } = await api.get("user/me/");
  return data; // objeto do usuário
}

export async function refreshToken(refresh) {
  const { data } = await api.post("user/token/refresh/", { refresh });
  return data; // { access, refresh? }
}

// Movies
export async function fetchMovies(params = {}) {
  const { data } = await api.get("movies/", { params });
  return data;
}

// Movie Sessions
export async function fetchMovieSessions(params = {}) {
  const { data } = await api.get("movie-sessions/", { params });
  return data;
}

// Cinema Halls
export async function fetchCinemaHalls(params = {}) {
  const { data } = await api.get("cinema-halls/", { params });
  return data;
}

/**
 * Export default continua sendo a instância Axios (compat: this.axios = api)
 */
export default api;
