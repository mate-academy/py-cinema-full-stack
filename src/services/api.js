import api from "./apiClient";

export async function login(email, password) {
  const res = await api.post("/user/login/", { email, password });
  return res.data; // {access, refresh} или {token} зависит от бэка
}

export async function getMovies(params = {}) {
  const res = await api.get("/movies/", { params });
  return res.data;
}

export async function getMovie(id) {
  const res = await api.get(`/movies/${id}/`);
  return res.data;
}

export async function getMovieSessions(params = {}) {
  const res = await api.get("/movie-sessions/", { params });
  return res.data;
}

export async function createOrder(tickets) {
  const res = await api.post("/orders/", { tickets });
  return res.data;
}

export async function getOrders() {
  const res = await api.get("/orders/");
  return res.data;
}
