// src/axios.js
import axios from "axios";

// Base do backend (vem do .env do Vite). Remove "/" final pra evitar "//".
export const BASE_URL =
  (import.meta.env?.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  "http://localhost:8080";

console.log("[API] BASE_URL =", BASE_URL); // 👈 deixa visível no console

const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials: false  // com JWT no header, mantemos falso
});

// Interceptor de request: adiciona Bearer token e Content-Type correto
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    // deixa o navegador definir boundary do multipart
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// (Opcional) log de erro pra facilitar debug/revisão
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // eslint-disable-next-line no-console
    console.error("[API]", err?.response?.status, err?.config?.url, err?.response?.data);
    return Promise.reject(err);
  }
);

export default api;
