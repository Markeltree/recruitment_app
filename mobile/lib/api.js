import axios from 'axios';
import { API_URL } from '../constants/config';
import { tokenStorage } from './storage';

if (__DEV__) console.log('[api] baseURL =', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token to every request
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors into a single message string
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out' : null) ||
      (error.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : null) ||
      'Something went wrong';

    if (status === 401 && globalThis.__applyupOnUnauthorized) {
      globalThis.__applyupOnUnauthorized();
    }
    const err = new Error(message);
    err.status = status;
    err.details = data?.details;
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.user),
  changePassword: (body) => api.post('/auth/change-password', body).then((r) => r.data),
};

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }).then((r) => r.data),
  feed: () => api.get('/jobs/feed').then((r) => r.data.data),
  categories: () => api.get('/jobs/categories').then((r) => r.data.data),
  get: (id) => api.get(`/jobs/${id}`).then((r) => r.data.data),
};

export const swipesApi = {
  record: (jobId, direction) => api.post('/swipes', { jobId, direction }).then((r) => r.data),
  saved: () => api.get('/swipes/saved').then((r) => r.data.data),
  undo: (jobId) => api.delete(`/swipes/${jobId}`).then((r) => r.data),
};

export const applicationsApi = {
  mine: () => api.get('/applications/me').then((r) => r.data.data),
  // body: { coverNote, expectedPay: { amount, period }, availability, portfolioIds }
  apply: (jobId, body) => api.post(`/applications/${jobId}`, body).then((r) => r.data.data),
  withdraw: (id) => api.post(`/applications/${id}/withdraw`).then((r) => r.data.data),
};

export const userApi = {
  update: (body) => api.patch('/users/me', body).then((r) => r.data.user),
  // Portfolio endpoints return the full, updated portfolio array
  addProject: (body) => api.post('/users/me/portfolio', body).then((r) => r.data.data),
  updateProject: (id, body) => api.patch(`/users/me/portfolio/${id}`, body).then((r) => r.data.data),
  removeProject: (id) => api.delete(`/users/me/portfolio/${id}`).then((r) => r.data.data),
  stats: () => api.get('/users/me/stats').then((r) => r.data.data),
  deleteAccount: () => api.delete('/users/me').then((r) => r.data),
};

// AI calls take longer than regular requests, so they get a wider timeout
const AI_TIMEOUT = 90000;

export const aiApi = {
  coverNote: (jobId, tone) => api.post(`/ai/cover-note/${jobId}`, { tone }, { timeout: AI_TIMEOUT }).then((r) => r.data.data.note),
  match: (jobId, refresh) =>
    api.get(`/ai/match/${jobId}`, { params: refresh ? { refresh: 1 } : undefined, timeout: AI_TIMEOUT }).then((r) => r.data.data),
};

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  markRead: (id) => api.post(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
};
