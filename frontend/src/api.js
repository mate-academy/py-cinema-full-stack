export function baseUrl () {
  const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
  const base = env && env.trim() ? env.trim() : 'http://localhost:8080';
  return new URL('/', base).origin;
}

export async function apiGet (path) {
  const access = localStorage.getItem('access');
  const resp = await fetch(new URL(path, baseUrl()).toString(), {
    headers: { Authorization: `Bearer ${access}` }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
