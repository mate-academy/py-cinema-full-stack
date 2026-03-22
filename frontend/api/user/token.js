import axios from "axios";

const USER_API_URL = import.meta.env.VITE_USER_API_URL;

export async function loginUser(email, password) {
  return axios.post(`${USER_API_URL}/token/`, { email, password });
}
