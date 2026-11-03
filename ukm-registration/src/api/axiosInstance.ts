import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Hanya tambahkan user token jika tidak ada Authorization header khusus
  if (!config.headers.Authorization) {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Jangan auto-redirect jika URL adalah endpoint admin/auth/login atau /admin
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/admin')) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
