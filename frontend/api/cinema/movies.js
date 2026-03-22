import axios from "axios";

const CINEMA_API_URL = import.meta.env.VITE_API_URL;

export async function getMovies(token, params = {}) {
  return axios.get(`${CINEMA_API_URL}/movies/`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
}

export async function addMovie(token, movieData) {
  return axios.post(`${CINEMA_API_URL}/movies/`, movieData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getMovieDetails(token, id) {
  return axios.get(`${CINEMA_API_URL}/movies/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function updateMovie(token, id, movieData) {
  return axios.patch(`${CINEMA_API_URL}/movies/${id}/`, movieData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
