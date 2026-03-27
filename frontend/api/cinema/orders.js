import axios from "axios";

const CINEMA_API_URL = import.meta.env.VITE_API_URL;

export async function getOrders(token) {
  return axios.get(`${CINEMA_API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function createOrder(token, orderData) {
  return axios.post(`${CINEMA_API_URL}/orders`, orderData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
