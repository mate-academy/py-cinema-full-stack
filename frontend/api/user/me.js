import axios from "axios";

const USER_API_URL = import.meta.env.VITE_USER_API_URL;

export async function getUserProfile(token) {
  return axios.get(`${USER_API_URL}/me/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
