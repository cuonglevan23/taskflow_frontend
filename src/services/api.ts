// API Service - Centralized API configuration and utilities
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
          
          // Update tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          localStorage.setItem('token_expires_at', 
            (Date.now() + expiresIn * 1000).toString()
          );

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get(url, config),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data, config),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data, config),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data, config),
  
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete(url, config),
};

export default api;