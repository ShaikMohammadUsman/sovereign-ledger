import axios from 'axios';

/** Same-origin /api on Vercel; full URL when frontend is hosted separately */
const apiBaseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? '/api' : '/api');

const api = axios.create({
  baseURL: apiBaseURL,
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

export const zohoService = {
  getStatus: () => api.get('/zoho/status'),
  getConnectUrl: () =>
    api.get('/zoho/connect', { params: { returnUrl: window.location.origin } }),
  disconnect: () => api.post('/zoho/disconnect'),
  syncVendors: () => api.post('/zoho/sync/vendors'),
  importVendorsFromZoho: () => api.post('/zoho/import/vendors'),
  syncVendor: (id: string) => api.post(`/zoho/sync/vendors/${id}`),
  syncPurchaseOrder: (id: string) => api.post(`/zoho/sync/purchase-orders/${id}`),
  syncPoFinancials: (id: string) => api.post(`/zoho/sync/purchase-orders/${id}/financials`),
  syncAllBills: () => api.post('/zoho/sync/bills'),
  retryFailedPurchaseOrders: () => api.post('/zoho/sync/purchase-orders/retry-failed'),
  regenerateWebhookSecret: () => api.post('/zoho/webhook/regenerate-secret'),
};

export default api;
