import axios from 'axios';

const axiosConfig = {
  baseURL: import.meta.env.VITE_API_URL,
  // timeout: 600000, //10 mnts
  // timeout: 70000,
  headers: {
    'Content-Type': 'application/json',
    'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
  },
};

const api = axios.create(axiosConfig);
export default api;
