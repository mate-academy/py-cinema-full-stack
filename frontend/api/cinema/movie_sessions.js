import axios from "axios";

const CINEMA_API_URL = import.meta.env.VITE_API_URL;

export async function getMovieSessions(token, params = {}) {
  return axios.get(`${CINEMA_API_URL}/movie_sessions/`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
}

export async function createMovieSession(token, sessionData) {
  return axios.post(`${CINEMA_API_URL}/movie_sessions/`, sessionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getMovieSessionDetails(token, id) {
  return axios.get(`${CINEMA_API_URL}/movie_sessions/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
