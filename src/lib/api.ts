import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:5250/api'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to inject JWT token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('ers_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      const reqUrl = String(error.config?.url ?? '');
      if (!reqUrl.includes('/auth/login')) {
        localStorage.removeItem('ers_token');
        localStorage.removeItem('ers_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
