'use client';

// Professional API Client - Centralized HTTP Configuration
import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosProgressEvent
} from 'axios';
import { SafeLogger } from '@/utils/safeLogger';

// API Configuration - Uses Backend JWT with HTTP-only cookies
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable HTTP-only cookies for JWT authentication
};

// Create main API instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request Interceptor - Authentication & Logging
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Backend JWT authentication is handled automatically via HTTP-only cookies
    // No need for manual token management
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Error Handling & Logging
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError) => {
    const method = error?.config?.method?.toUpperCase() || 'REQUEST';
    const url = error?.config?.url || 'unknown';
    const status = error?.response?.status;
    const statusText = error?.response?.statusText || '';

    // Use safe logger to prevent crashes
    if (status) {
      SafeLogger.error('❌ API Error:', method, url, '→', status, statusText || '');
    } else {
      SafeLogger.error('❌ Network Error:', method, url, '→ Cannot reach server');
    }

    // Handle authentication errors
    if (status === 401) {
      // Redirect to login page for authentication errors
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API Helper Functions
export const api = {
  // GET request
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },

  // POST request
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },

  // PUT request
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },

  // Upload file with progress
  upload: <T = unknown>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // Download file
  download: (url: string, filename?: string): Promise<void> => {
    return apiClient.get(url, {
      responseType: 'blob',
    }).then((response: AxiosResponse) => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

// Health Check Function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch {
    // Health check failed
    return false;
  }
};

// Authentication Test Function
export const testAuthentication = async (): Promise<boolean> => {
  try {
    // Try multiple endpoints to find one that works
    const testEndpoints = [
      '/api/user/me',
      '/api/users/me',
      '/api/auth/verify',
      '/api/tasks',
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        await api.get(endpoint);
        return true;
      } catch {
        continue;
      }
    }
    
    return false;
  } catch {
    return false;
  }
};

// Update API base URL (useful for environment switching)
export const updateBaseURL = (newBaseURL: string): void => {
  apiClient.defaults.baseURL = newBaseURL;
  // API base URL updated
};

// Get current API configuration
export const getApiConfig = () => ({
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
  headers: apiClient.defaults.headers,
});

// Export the API interface
export type ApiInterface = typeof api;
export default api;