const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl (path) {
  if (!path) return path;

  try {
    const url = new URL(path);
    return `${API_BASE_URL}${url.pathname}${url.search}`;
  } catch {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
