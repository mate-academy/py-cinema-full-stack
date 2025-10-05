// src/api/http.js
import axios from "axios";

// Base do backend (vem do .env ou padrão local)
const base =
  (import.meta.env?.VITE_API_URL?.replace(/\/$/, "")) || "http://127.0.0.1:8080";

const http = axios.create({
  baseURL: base,
  // NÃO defina Content-Type aqui; deixamos para o interceptor
});

// Interceptor de request
http.interceptors.request.use((config) => {
  // Garante objeto headers
  config.headers = config.headers || {};

  // Anexa o token se existir
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 👇 Parte importante: se for FormData, não setar Content-Type
  if (config.data instanceof FormData) {
    // Alguns bundlers normalizam para minúsculo; removemos ambos por segurança
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else {
    // Para os demais (JSON), defina Content-Type se ainda não existir
    if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  return config;
});

export default http;
