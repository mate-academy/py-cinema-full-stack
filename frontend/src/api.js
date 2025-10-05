// frontend/src/api.js

// --- Base URL (SEM barra final) ---
export function baseUrl () {
  const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
  const base = env && env.trim() ? env.trim() : 'http://127.0.0.1:8080';
  // garante 'http://host:port', sem barra no final
  return new URL('/', base).origin;
}

// --- Helper: monta URL com query params corretamente ---
function toUrl (path, params) {
  const url = new URL(path, baseUrl());
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

// --- Pega tokens do storage ---
function getAccess () {
  return localStorage.getItem('access') || '';
}
function getRefresh () {
  return localStorage.getItem('refresh') || '';
}
function setAccess (token) {
  if (token) localStorage.setItem('access', token);
}

// --- Wrapper fetch com refresh automático em 401 ---
async function apiFetch (path, { method = 'GET', headers = {}, body, params } = {}, _retry = false) {
  const url = toUrl(path, params);
  const access = getAccess();

  // não defina Content-Type quando body for FormData!
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const mergedHeaders = {
    Accept: 'application/json',
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
    ...(!isFormData && body && typeof body === 'object' && !(body instanceof Blob)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...headers,
  };

  const payload = (!isFormData && body && typeof body === 'object' && !(body instanceof Blob))
    ? JSON.stringify(body)
    : body;

  const resp = await fetch(url, { method, headers: mergedHeaders, body: payload });

  // Tenta refresh uma única vez se 401
  if (resp.status === 401 && !_retry) {
    const refresh = getRefresh();
    if (refresh) {
      const refreshResp = await fetch(new URL(endpoints.tokenRefresh, baseUrl()).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (refreshResp.ok) {
        const data = await refreshResp.json();
        if (data && data.access) {
          setAccess(data.access);
          // repete a chamada original
          return apiFetch(path, { method, headers, body, params }, true);
        }
      }
    }
  }

  if (!resp.ok) {
    // tenta extrair json de erro para debugar melhor
    let details = '';
    try { details = await resp.text(); } catch (_) {}
    const err = new Error(`HTTP ${resp.status} ${resp.statusText} @ ${url} ${details ? '- ' + details : ''}`);
    err.status = resp.status;
    throw err;
  }

  // algumas respostas podem ser 204 No Content
  const contentType = resp.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  return resp.json();
}

// --- GET/POST genéricos ---
export async function apiGet (path, params) {
  return apiFetch(path, { method: 'GET', params });
}
export async function apiPost (path, body) {
  return apiFetch(path, { method: 'POST', body });
}

// --- Helper: aceita tanto lista paginada quanto array puro ---
export function unwrap (data) {
  return Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
}

// ========================
// CINEMA APIs de alto nível
// ========================

// Halls: GET /cinema-halls/
export async function getCinemaHalls () {
  const data = await apiGet(endpoints.halls);
  return unwrap(data);
}

// Sessions: GET /movie-sessions/?date=YYYY-MM-DD&movie=ID
export async function getMovieSessions ({ date, movie } = {}) {
  const data = await apiGet(endpoints.sessions, { date, movie });
  return unwrap(data);
}

// Movies: GET /movies/?genres=1,2&actors=3&title=foo
export async function getMovies ({ genres, actors, title } = {}) {
  const params = {
    title: title || undefined,
    genres: Array.isArray(genres) && genres.length ? genres.join(',') : undefined,
    actors: Array.isArray(actors) && actors.length ? actors.join(',') : undefined,
  };
  const data = await apiGet(endpoints.movies, params);
  return unwrap(data);
}

// Upload de poster: POST /movies/{id}/upload-image/  (FormData, sem Content-Type manual)
export async function uploadMovieImage (movieId, file) {
  const fd = new FormData();
  fd.append('image', file);
  return apiFetch(endpoints.movieUpload(movieId), { method: 'POST', body: fd });
}

// Me: GET /user/me/ (bom para testar token)
export async function getMe () {
  return apiGet(endpoints.me);
}

// --- Endpoints padronizados (com HÍFEN e BARRA FINAL) ---
// (declarado no final, mas usado somente quando as funções são chamadas)
export const endpoints = {
  halls: '/api/cinema/cinema-halls/',
  sessions: '/api/cinema/movie-sessions/',
  movies: '/api/cinema/movies/',
  movieUpload: (id) => `/api/cinema/movies/${id}/upload-image/`,
  me: '/api/user/me/',
  tokenRefresh: '/api/user/token/refresh/',
};
