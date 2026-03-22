import axios from "axios";

const CINEMA_API_URL = import.meta.env.VITE_API_URL;

export async function getCinemaHalls(token) {
  return axios.get(`${CINEMA_API_URL}/cinema_halls/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function addCinemaHall(token, hallData) {
  return axios.post(`${CINEMA_API_URL}/cinema_halls/`, hallData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
