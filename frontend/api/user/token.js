import axios from "axios";

const USER_API_URL = import.meta.env.VITE_USER_API_URL;

export async function loginUser(email, password) {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  return axios.post(`${USER_API_URL}/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}
