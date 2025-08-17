// Professional API Client - Centralized HTTP Configuration
import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosProgressEvent
} from 'axios';
import { CookieAuth } from '@/utils/cookieAuth';
import { SafeLogger } from '@/utils/safeLogger';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // JWT-only authentication
};

// Create main API instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request Interceptor - Authentication & Logging
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Try to get token from NextAuth session first
    let token = null;
    
    // Import auth dynamically to avoid SSR issues
    if (typeof window !== 'undefined') {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        token = session?.user?.accessToken;
        
        if (token) {
          console.log('🔑 Using NextAuth session token for API request');
        }
      } catch (error) {
        console.warn('⚠️ Failed to get NextAuth session:', error);
      }
    }
    
    // Fallback to cookies if NextAuth session not available
    if (!token) {
      token = CookieAuth.getAccessToken();
      if (token) {
        console.log('🍪 Using cookie token for API request');
      }
    }
    
    if (token && config.headers) {
      // Add Bearer token to Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('📤 Authorization header added:', `Bearer ${token.substring(0, 20)}...`);
      
      // Add user context headers for backend compatibility
      const payload = CookieAuth.getTokenPayload() || (() => {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch {
          return null;
        }
      })();
      
      if (payload) {
        config.headers['X-User-ID'] = payload.userId?.toString();
        config.headers['X-User-Email'] = payload.email;
        
        if (payload.roles) {
          config.headers['X-User-Roles'] = JSON.stringify(payload.roles);
          config.headers['X-User-Role'] = payload.roles[0]; // Primary role
          config.headers['X-User-Authorities'] = JSON.stringify(payload.roles.map((role: string) => `ROLE_${role}`));
        }
      }
    } else {
      console.warn('⚠️ No access token found for request:', config.url);
      console.warn('📋 Available auth sources:', {
        nextAuthSession: 'checked',
        cookieToken: CookieAuth.getAccessToken() ? 'present' : 'missing'
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Error Handling & Logging
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError) => {
    // Simple, safe error handling - no over-engineering
    const method = error?.config?.method?.toUpperCase() || 'REQUEST';
    const url = error?.config?.url || 'unknown';
    const status = error?.response?.status;
    const statusText = error?.response?.statusText || '';

    // Use safe logger to prevent all crashes
    if (status) {
      SafeLogger.error('❌ API Error:', method, url, '→', status, statusText || '');
    } else {
      SafeLogger.error('❌ Network Error:', method, url, '→ Cannot reach server');
    }

    // Handle specific error cases
    if (status === 401) {
      console.warn('🚨 401 Unauthorized - API call failed');
      // Don't automatically redirect or clear auth - let NextAuth/UserContext handle it
      // This prevents infinite redirect loops
    } else if (status === 403) {
      console.error('🚨 403 Forbidden - Check user permissions');
    } else if (!status) {
      console.error('🚨 Network Error - Backend unreachable');
    } else if (status >= 500) {
      console.error('🚨 Server Error - Backend issue');
    }

    // Return simple rejected promise
    return Promise.reject(error);
  }
);

// API Helper Functions
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
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
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },

  // Upload file with progress
  upload: <T = any>(
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
    }).then((response) => {
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
    console.log('🏥 Performing health check...');
    const response = await api.get('/actuator/health');
    console.log('✅ Backend is healthy:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// Authentication Test Function
export const testAuthentication = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing authentication...');
    
    // Try multiple endpoints to find one that works
    const testEndpoints = [
      '/api/user/me',
      '/api/users/me',
      '/api/auth/verify',
      '/api/tasks',
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await api.get(endpoint);
        console.log(`✅ Authentication test successful on ${endpoint}:`, response.status);
        return true;
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        console.log(`❌ Failed ${endpoint}:`, axiosError.response?.status);
      }
    }
    
    console.error('❌ All authentication endpoints failed');
    return false;
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
};

// Update API base URL (useful for environment switching)
export const updateBaseURL = (newBaseURL: string): void => {
  apiClient.defaults.baseURL = newBaseURL;
  console.log('🔧 API base URL updated to:', newBaseURL);
};

// Get current API configuration
export const getApiConfig = () => ({
  baseURL: apiClient.defaults.baseURL,
  timeout: apiClient.defaults.timeout,
  headers: apiClient.defaults.headers,
});

// Export the axios instance for advanced usage
export { apiClient };

// Default export
export default api;