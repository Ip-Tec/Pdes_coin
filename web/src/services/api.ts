import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Load API URL from .env
});

export const fetchWalletData = async () => {
  const response = await API.get('/wallet');
  return response.data;
};

export default API;
