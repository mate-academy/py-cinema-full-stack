import axios from "axios";

const USER_API_URL = import.meta.env.VITE_USER_API_URL;

export async function registerUser(email, password, firstName = "", lastName = "") {
  return axios.post(`${USER_API_URL}/register`, {
    email,
    password,
    first_name: firstName,
    last_name: lastName,
  });
}
