const ACCESS_KEY = "access_token";

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_KEY);
}
