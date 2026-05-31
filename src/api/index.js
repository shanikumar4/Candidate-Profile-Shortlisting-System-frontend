import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60 second timeout to handle cold starts
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 + Auto-retry on 502/503 (Render cold start)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;

    // Render free tier cold start: retry once after 4 seconds
    if ((status === 502 || status === 503 || !status) && !err.config._retried) {
      err.config._retried = true;
      await new Promise((r) => setTimeout(r, 4000));
      return api(err.config);
    }

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
