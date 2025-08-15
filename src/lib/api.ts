// Centralized API Client - Professional HTTP wrapper with interceptors
import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosProgressEvent
} from 'axios';
import { CookieAuth } from '@/utils/cookieAuth';
import { SafeLogger } from '@/utils/safeLogger';

// API Configuration
interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // JWT-only authentication
};

// Error normalization interface
interface NormalizedError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Create main API instance
class ApiClient {
  private instance: AxiosInstance;
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.instance = axios.create(this.config);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor - Authentication & Logging
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = CookieAuth.getAccessToken();
        
        if (token && config.headers) {
          // Add Bearer token to Authorization header
          config.headers['Authorization'] = `Bearer ${token}`;
          
          // Add user context headers for backend compatibility
          const payload = CookieAuth.getTokenPayload();
          if (payload) {
            config.headers['X-User-ID'] = payload.userId?.toString();
            config.headers['X-User-Email'] = payload.email;
            
            if (payload.roles) {
              config.headers['X-User-Roles'] = JSON.stringify(payload.roles);
              config.headers['X-User-Role'] = payload.roles[0]; // Primary role
              config.headers['X-User-Authorities'] = JSON.stringify(
                payload.roles.map((role: string) => `ROLE_${role}`)
              );
            }
          }
        }
        
        return config;
      },
      (error) => {
        SafeLogger.error('❌ Request interceptor error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response Interceptor - Error Handling & Token Refresh
    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        return response;
      },
      async (error: AxiosError) => {
        const normalizedError = this.normalizeError(error);
        
        // Handle specific error cases
        if (normalizedError.status === 401) {
          await this.handleUnauthorized();
        } else if (normalizedError.status === 403) {
          SafeLogger.error('🚨 403 Forbidden - Check user permissions');
          // Try to refresh token if 403 might be due to expired token
          await this.handleForbidden();
        } else if (normalizedError.status && normalizedError.status >= 500) {
          SafeLogger.error('🚨 Server Error - Backend issue');
        } else if (!normalizedError.status) {
          SafeLogger.error('🚨 Network Error - Backend unreachable');
        }

        return Promise.reject(normalizedError);
      }
    );
  }

  private normalizeError(error: unknown): NormalizedError {
    const axiosError = error as any; // Type assertion for axios error
    const method = axiosError?.config?.method?.toUpperCase() || 'REQUEST';
    const url = axiosError?.config?.url || 'unknown';
    const status = axiosError?.response?.status;
    const statusText = axiosError?.response?.statusText || '';
    const data = axiosError?.response?.data;

    // Log the error safely
    if (status) {
      SafeLogger.error('❌ API Error:', method, url, '→', status, statusText);
    } else {
      SafeLogger.error('❌ Network Error:', method, url, '→ Cannot reach server');
    }

    // Return normalized error structure
    return {
      message: data?.message || axiosError?.message || `${method} ${url} failed`,
      status,
      code: data?.code || axiosError?.code,
      details: data?.details || data,
    };
  }

  private async handleUnauthorized(): Promise<void> {
    SafeLogger.error('🚨 401 Unauthorized - Clearing auth and redirecting...');
    
    try {
      // Try to refresh token first
      const refreshToken = CookieAuth.getRefreshToken();
      if (refreshToken) {
        // Implement token refresh logic here if needed
        // For now, just clear auth
      }
      
      CookieAuth.clearAuth();
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } catch (authError) {
      // Silent fail - don't cause more errors
      SafeLogger.error('Failed to handle unauthorized error:', authError);
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  // File upload with progress
  async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // File download
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Performing health check...');
      const response = await this.get('/actuator/health');
      console.log('✅ Backend is healthy:', response.status);
      return true;
    } catch (error) {
      SafeLogger.error('❌ Backend health check failed:', error);
      return false;
    }
  }

  // Authentication test
  async testAuthentication(): Promise<boolean> {
    try {
      console.log('🧪 Testing authentication...');
      
      const testEndpoints = [
        '/api/user/me',
        '/api/users/me',
        '/api/auth/verify',
        '/api/tasks',
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await this.get(endpoint);
          console.log(`✅ Authentication test successful on ${endpoint}:`, response.status);
          return true;
        } catch (error: any) {
          console.log(`❌ Failed ${endpoint}:`, error.status);
        }
      }
      
      SafeLogger.error('❌ All authentication endpoints failed');
      return false;
    } catch (error) {
      SafeLogger.error('❌ Authentication test failed:', error);
      return false;
    }
  }

  // Configuration methods
  updateBaseURL(newBaseURL: string): void {
    this.config.baseURL = newBaseURL;
    this.instance.defaults.baseURL = newBaseURL;
    console.log('🔧 API base URL updated to:', newBaseURL);
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }

  // Get raw axios instance for advanced usage
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create default instance
const apiClient = new ApiClient();

// Export both class and instance
export { ApiClient, apiClient };

// Export convenience methods
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  upload: apiClient.upload.bind(apiClient),
  download: apiClient.download.bind(apiClient),
  healthCheck: apiClient.healthCheck.bind(apiClient),
  testAuthentication: apiClient.testAuthentication.bind(apiClient),
  updateBaseURL: apiClient.updateBaseURL.bind(apiClient),
  getConfig: apiClient.getConfig.bind(apiClient),
};

// Default export
export default api;