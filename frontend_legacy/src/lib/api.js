import axios from 'axios';

const api = axios.create({
  // Dynamically switch between Production Render and Local Development
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
