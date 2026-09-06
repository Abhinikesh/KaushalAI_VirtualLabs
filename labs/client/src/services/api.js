import axios from 'axios';

export const LAB_TOKEN_STORAGE_KEY = 'lab_access_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_LABS_API_URL || 'http://localhost:5001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: automatically attaches Bearer token from sessionStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem(LAB_TOKEN_STORAGE_KEY);
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API Client] Could not read session token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handles 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API Client] Unauthorized or expired lab session');
    }
    return Promise.reject(error);
  }
);

// Health check call
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Root info call
export const getServiceInfo = async () => {
  const response = await api.get('/');
  return response.data;
};

// Verify Lab Session API call
export const verifyLabSession = async (explicitToken = null) => {
  const headers = {};
  if (explicitToken) {
    headers.Authorization = `Bearer ${explicitToken}`;
  }
  const response = await api.get('/api/lab-session/verify', { headers });
  return response.data;
};

export default api;
