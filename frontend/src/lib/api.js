import axios from 'axios';

const api = axios.create({
  // Use 127.0.0.1 to avoid common Windows localhost resolution issues
  baseURL: 'http://127.0.0.1:8000'
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
