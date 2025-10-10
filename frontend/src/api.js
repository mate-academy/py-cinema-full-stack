// src/api.js
import api, { BASE_URL } from "./axios";

/* ===========================
   USER
=========================== */

// Envia email e username juntos para cobrir ambos os casos de backend
export const login = (email, password) =>
  api
    .post(`${BASE_URL}/api/user/token/`, { email, username: email, password })
    .then((r) => r.data);

export const refreshToken = (refresh) =>
  api.post("/api/user/token/refresh/", { refresh }).then((r) => r.data);

export const fetchMe = () => api.get("/api/user/me/").then((r) => r.data);

/* ===========================
   CINEMA
=========================== */

export const fetchMovies = (params = {}) =>
  api.get("/api/cinema/movies/", { params }).then((r) => r.data);

export const fetchMovieSessions = (params = {}) =>
  api.get("/api/cinema/movie-sessions/", { params }).then((r) => r.data);

export const fetchCinemaHalls = (params = {}) =>
  api.get("/api/cinema/cinema-halls/", { params }).then((r) => r.data);
