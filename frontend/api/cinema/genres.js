import axios from "axios";

const CINEMA_API_URL = import.meta.env.VITE_API_URL;

export async function getGenres(token) {
  return axios.get(`${CINEMA_API_URL}/genres`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function addGenre(token, genreData) {
  return axios.post(`${CINEMA_API_URL}/genres`, genreData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
