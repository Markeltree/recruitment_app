import axios from 'axios';

const TOKEN_KEY = 'applyup_admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      tokenStore.clear();
      window.dispatchEvent(new Event('applyup:logout'));
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    const err = new Error(message);
    err.status = error.response?.status;
    err.details = error.response?.data?.details;
    return Promise.reject(err);
  }
);

export const adminApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.user),
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data.data),

  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  user: (id) => api.get(`/admin/users/${id}`).then((r) => r.data.data),
  updateUser: (id, body) => api.patch(`/admin/users/${id}`, body).then((r) => r.data.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  userActivity: (id, params) => api.get(`/admin/users/${id}/activity`, { params }).then((r) => r.data),
  activity: (params) => api.get('/admin/activity', { params }).then((r) => r.data),

  jobs: (params) => api.get('/admin/jobs', { params }).then((r) => r.data),
  createJob: (body) => api.post('/jobs', body).then((r) => r.data.data),
  updateJob: (id, body) => api.patch(`/jobs/${id}`, body).then((r) => r.data.data),
  deleteJob: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
  jobDetail: (id) => api.get(`/jobs/${id}`).then((r) => r.data.data),

  applications: (params) => api.get('/applications', { params }).then((r) => r.data),
  setApplicationStatus: (id, body) => api.patch(`/applications/${id}/status`, body).then((r) => r.data.data),

  notifications: () => api.get('/admin/notifications').then((r) => r.data.data),
  broadcast: (body) => api.post('/admin/notifications', body).then((r) => r.data.data),
};
