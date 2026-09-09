import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      const isAdminCall = String(err.config.url || '').startsWith('/admin');
      if (isAdminCall && localStorage.getItem('sms_token')) {
        localStorage.removeItem('sms_token');
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;