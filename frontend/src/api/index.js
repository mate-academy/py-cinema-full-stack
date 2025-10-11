// Vue 2 + Axios + JWT (access/refresh) + helpers + persistência em localStorage

import axios from "axios";

// BASE_URL: se usa proxy do Vite, deixe vazio "".
// Caso contrário, defina VITE_API_URL no .env (ex.: http://127.0.0.1:8080)
const BASE_URL = (import.meta?.env?.VITE_API_URL ?? "").trim();

/** Junta base e path sem barras duplas */
function joinUrl(base, path) {
  if (!base) return path; // com proxy do Vite
  return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

export const api = axios.create({
  baseURL: BASE_URL, // com proxy: "", sem proxy: http://127.0.0.1:8080
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// =======================
// Tokens: memória + localStorage
// =======================
let accessToken = null;
let refreshToken = null;

const LS_ACCESS_KEY = "auth_access";
const LS_REFRESH_KEY = "auth_refresh";

export function setTokens({ access, refresh, persist = true }) {
  accessToken = access || null;
  refreshToken = refresh || null;

  if (persist) {
    if (access) localStorage.setItem(LS_ACCESS_KEY, access);
    if (refresh) localStorage.setItem(LS_REFRESH_KEY, refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(LS_ACCESS_KEY);
  localStorage.removeItem(LS_REFRESH_KEY);
}

export function initTokensFromStorage() {
  const a = localStorage.getItem(LS_ACCESS_KEY);
  const r = localStorage.getItem(LS_REFRESH_KEY);
  if (a || r) {
    accessToken = a || null;
    refreshToken = r || null;
  }
}

export function isAuthenticated() {
  return Boolean(accessToken || localStorage.getItem(LS_ACCESS_KEY));
}

export function getBaseUrl() {
  return BASE_URL;
}

// =======================
// Interceptor de requisição: Bearer
// =======================
api.interceptors.request.use((config) => {
  if (!accessToken) {
    const a = localStorage.getItem(LS_ACCESS_KEY);
    if (a) accessToken = a;
  }
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// =======================
// Interceptor de resposta: auto-refresh 401
// =======================
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, newAccess) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccess);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    if (status === 401 && (refreshToken || localStorage.getItem(LS_REFRESH_KEY)) && !original._retry) {
      original._retry = true;

      if (!refreshToken) {
        const r = localStorage.getItem(LS_REFRESH_KEY);
        if (r) refreshToken = r;
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newAccess) => {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${newAccess}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      try {
        isRefreshing = true;

        // Usa URL absoluta se BASE_URL estiver preenchida, senão usa rota relativa p/ proxy do Vite
        const refreshUrl = joinUrl(BASE_URL, "/api/user/token/refresh/");
        const { data } = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccess = data?.access;
        if (!newAccess) throw new Error("Refresh retornou sem access");

        setTokens({ access: newAccess, refresh: refreshToken, persist: true });
        processQueue(null, newAccess);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// =======================
// Auth helpers
// =======================
export async function login(email, password) {
  // funciona com proxy (rota relativa) e sem proxy (baseURL absoluto no api)
  const { data } = await api.post(`/api/user/token/`, { email, password });
  setTokens({ access: data.access, refresh: data.refresh, persist: true });
  return data;
}

export async function me() {
  const { data } = await api.get(`/api/user/me/`);
  return data;
}

// =======================
// Helpers usados nas telas (rotas de CINEMA com prefixo /api/cinema/)
// =======================
export async function fetchMovies(params = {}) {
  const { data } = await api.get(`/api/cinema/movies/`, { params });
  return data;
}

export async function fetchMovieSessions(params = {}) {
  const { data } = await api.get(`/api/cinema/movie-sessions/`, { params });
  return data;
}

export async function fetchCinemaHalls(params = {}) {
  const { data } = await api.get(`/api/cinema/cinema-halls/`, { params });
  return data;
}

export async function fetchActors(params = {}) {
  const { data } = await api.get(`/api/cinema/actors/`, { params });
  return data;
}

export async function fetchGenres(params = {}) {
  const { data } = await api.get(`/api/cinema/genres/`, { params });
  return data;
}

export async function fetchMe() {
  return me();
}

export async function fetchMovieSessionDetail(id) {
  const { data } = await api.get(`/api/cinema/movie-sessions/${id}/`);
  return data;
}

// =======================
// Orders (NOVO)
// =======================
export async function createOrder(tickets) {
  // tickets: [{ row, seat, movie_session }, ...]
  const { data } = await api.post(`/api/cinema/orders/`, { tickets });
  return data; // { id, tickets, created_at }
}

export async function getOrders(params = {}) {
  const { data } = await api.get(`/api/cinema/orders/`, { params });
  return data; // paginado
}

export async function cancelOrder(orderId) {
  await api.delete(`/api/cinema/orders/${orderId}/`);
  return true;
}

export default api;
