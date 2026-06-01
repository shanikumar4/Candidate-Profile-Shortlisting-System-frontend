import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 35000, // 35s — server allows 25s for Gemini + buffer for Render proxy overhead
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Pre-warm the Render free-tier backend silently on app mount
// Call this once from App.jsx so the server is awake before the user needs it
export const warmServer = () => {
  api.get('/ping').catch(() => {}); // fire-and-forget, never throws
};

export default api;
