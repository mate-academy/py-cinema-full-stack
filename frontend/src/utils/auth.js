import axios from 'axios';

export const ACCESS_KEY = 'access';
export const ACCESS_KEY_LEGACY = 'accessToken';
export const REFRESH_KEY = 'refresh';
export const REFRESH_KEY_LEGACY = 'refreshToken';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY_LEGACY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY_LEGACY);
}

export function setTokens(access, refresh) {
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(ACCESS_KEY_LEGACY, access);
  }

  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(REFRESH_KEY_LEGACY, refresh);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(ACCESS_KEY_LEGACY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(REFRESH_KEY_LEGACY);
}

export function setAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}
