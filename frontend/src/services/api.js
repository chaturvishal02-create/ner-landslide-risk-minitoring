import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8000' : 'https://landslide-backend-5duo.onrender.com');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ── Endpoints ──────────────────────────────────────────────────────────────

export const healthAPI = () => api.get('/api/health');

export const dashboardAPI = () => api.get('/api/dashboard');

export const locationsAPI = () => api.get('/api/locations');
export const locationAPI = (id) => api.get(`/api/locations/${id}`);

export const alertsAPI = (params = {}) => api.get('/api/alerts', { params });
export const createAlertAPI = (data) => api.post('/api/alerts', data);
export const acknowledgeAlertAPI = (id) => api.put(`/api/alerts/${id}/acknowledge`);

export const predictRiskAPI = (data) => api.post('/api/predict-risk', data);

export const rainfallAPI = (locationId) =>
  api.get('/api/rainfall', locationId ? { params: { location_id: locationId } } : {});

export const infrastructureAPI = (locationId) =>
  api.get('/api/infrastructure', locationId ? { params: { location_id: locationId } } : {});

export const historicalAPI = (params = {}) => api.get('/api/historical', { params });

export default api;
