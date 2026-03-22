import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  verifyCode: (data: { email: string, code: string }) => api.post('/auth/verify', data),
};

export const requestService = {
  getAll: () => api.get('/requests'),
  getById: (id: string) => api.get(`/requests/${id}`),
  create: (data: any) => api.post('/requests', data),
  update: (id: string, data: any) => api.put(`/requests/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/requests/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/requests/${id}`),
};

export const vendorService = {
  getAll: () => api.get('/vendors'),
  getById: (id: string) => api.get(`/vendors/${id}`),
  create: (data: any) => api.post('/vendors', data),
};

export const poService = {
  getAll: () => api.get('/purchase-orders'),
  getById: (id: string) => api.get(`/purchase-orders/${id}`),
  generate: (requestId: string) => api.post('/purchase-orders/generate', { requestId }),
};

export const aiService = {
  getInsights: () => api.get('/ai/insights'),
  chat: (message: string) => api.post('/ai/chat', { message }),
  getHistory: () => api.get('/ai/chat/history'),
};

export default api;
