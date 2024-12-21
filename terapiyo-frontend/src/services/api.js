import axios from 'axios';
import { toast } from 'react-toastify';
import axiosRetry from 'axios-retry';

// API yapılandırması
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Retry yapılandırması
axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});

// Token interceptor'u
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Debug için request interceptor
api.interceptors.request.use(request => {
  console.log('API Request:', {
    baseURL: request.baseURL,
    url: request.url,
    fullUrl: `${request.baseURL}${request.url}`,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Debug için response interceptor
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Hata mesajlarını göster
    const message = error.response?.data?.message || 'Bir hata oluştu';
    toast.error(message);

    // Token süresi dolmuşsa veya geçersizse
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
