export function getErrorMessage (err, fallback) {
  const data = err.response && err.response.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  return Object.values(data).flat().join(' ') || fallback;
}
