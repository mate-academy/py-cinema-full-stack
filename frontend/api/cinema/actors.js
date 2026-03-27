import axios from "axios";

const CINEMA_API_URL = import.meta.env.VITE_API_URL;

export async function getActors(token) {
  return axios.get(`${CINEMA_API_URL}/actors`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function addActor(token, actorData) {
  return axios.post(`${CINEMA_API_URL}/actors`, actorData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
