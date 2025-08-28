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
  maxRetries: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

// Circuit breaker state
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', // Empty string means same origin (Next.js app)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // JWT-only authentication
  maxRetries: 2,
  retryDelay: 1000,
  circuitBreakerThreshold: 5, // Open circuit after 5 consecutive failures
  circuitBreakerTimeout: 30000, // 30 seconds timeout
};

// Error normalization interface
interface NormalizedError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  isConnectionError?: boolean;
  isServerError?: boolean;
  userMessage?: string; // User-friendly message
}

// Create main API instance
class ApiClient {
  private instance: AxiosInstance;
  private config: ApiConfig;
  private circuitBreaker: CircuitBreakerState;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.instance = axios.create(this.config);
    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor - Authentication & Logging
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Get token only from cookies
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
        } else {
          console.warn('⚠️ No access token found - request will be unauthorized');
        }
        
        return config;
      },
      (error) => {
        SafeLogger.error('❌ Request interceptor error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response Interceptor - Error Handling & Circuit Breaker
    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        // Reset circuit breaker on successful response
        this.resetCircuitBreaker();
        return response;
      },
      async (error: AxiosError) => {
        const normalizedError = this.normalizeError(error);
        
        // Update circuit breaker on network errors and connection issues
        if (!normalizedError.status || normalizedError.status >= 500 || normalizedError.isConnectionError) {
          this.recordFailure();
        }
        
        // Handle specific error cases
        if (normalizedError.status === 401) {
          await this.handleUnauthorized();
        } else if (normalizedError.status === 403) {
          SafeLogger.error('🚨 403 Forbidden - Check user permissions');
          // Don't try to handle 403 automatically - let component handle it
          // await this.handleForbidden();
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
    const axiosError = error as AxiosError;
    const method = axiosError?.config?.method?.toUpperCase() || 'REQUEST';
    const url = axiosError?.config?.url || 'unknown';
    const status = axiosError?.response?.status;
    const statusText = axiosError?.response?.statusText || '';
    const data = axiosError?.response?.data;

    // Check for connection errors
    const isConnectionError = 
      axiosError?.code === 'ECONNREFUSED' ||
      axiosError?.code === 'ENOTFOUND' ||
      axiosError?.code === 'ETIMEDOUT' ||
      axiosError?.message?.includes('Network Error') ||
      axiosError?.message?.includes('fetch failed') ||
      !status;

    const isServerError = status ? status >= 500 : false;

    // Create user-friendly message
    let userMessage = '';
    if (isConnectionError) {
      userMessage = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau vài phút.';
    } else if (isServerError) {
      userMessage = 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    } else if (status === 401) {
      userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      userMessage = 'Bạn không có quyền thực hiện thao tác này.';
    } else if (status === 404) {
      userMessage = 'Không tìm thấy dữ liệu yêu cầu.';
    } else {
      userMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
    }

    // Log the error safely
    if (status) {
      SafeLogger.error('❌ API Error:', method, url, '→', status, statusText);
    } else {
      SafeLogger.error('❌ Network Error:', method, url, '→ Cannot reach server');
    }

    // Return normalized error structure
    const errorData = data as Record<string, unknown> | undefined;
    return {
      message: errorData?.message as string || axiosError?.message || `${method} ${url} failed`,
      status,
      code: errorData?.code as string || axiosError?.code,
      details: errorData?.details as Record<string, unknown> || errorData,
      isConnectionError,
      isServerError,
      userMessage,
    };
  }

  private async handleUnauthorized(): Promise<void> {
    SafeLogger.warn('🚨 401 Unauthorized - API call failed, letting NextAuth handle session');
    
    // Don't automatically clear auth or redirect - let NextAuth/UserContext handle it
    // This prevents infinite redirect loops from API calls that fail due to auth issues
    
    try {
      // Only log the issue, don't take any action that could cause loops
      SafeLogger.warn('Auth token may be expired or invalid');
      
      // Let the middleware and NextAuth handle the redirect properly
      // Don't force immediate redirects here
    } catch (authError) {
      // Silent fail - don't cause more errors
      SafeLogger.error('Failed to handle unauthorized error:', authError);
    }
  }

  // Circuit Breaker Methods
  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.nextAttemptTime = Date.now() + this.config.circuitBreakerTimeout;
      SafeLogger.warn('🔌 Circuit breaker OPEN - Server appears to be down');
    }
  }

  private resetCircuitBreaker(): void {
    if (this.circuitBreaker.isOpen || this.circuitBreaker.failureCount > 0) {
      SafeLogger.info('✅ Circuit breaker CLOSED - Server is back online');
    }
    
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = 0;
    this.circuitBreaker.nextAttemptTime = 0;
  }

  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreaker.isOpen) return false;
    
    // Check if we should try again (half-open state)
    if (Date.now() >= this.circuitBreaker.nextAttemptTime) {
      SafeLogger.info('🔄 Circuit breaker HALF-OPEN - Attempting to reconnect...');
      return false;
    }
    
    return true;
  }

  private async executeWithCircuitBreaker<T>(
    operation: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    // Check circuit breaker state
    if (this.isCircuitBreakerOpen()) {
      const timeUntilRetry = Math.ceil((this.circuitBreaker.nextAttemptTime - Date.now()) / 1000);
      const error = new Error(`Service temporarily unavailable. Retrying in ${timeUntilRetry}s`) as Error & {
        status: number;
        code: string;
      };
      error.status = 503;
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }

    return operation();
  }

  // HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithCircuitBreaker(() => this.instance.get<T>(url, config));
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithCircuitBreaker(() => this.instance.post<T>(url, data, config));
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithCircuitBreaker(() => this.instance.put<T>(url, data, config));
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithCircuitBreaker(() => this.instance.patch<T>(url, data, config));
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.executeWithCircuitBreaker(() => this.instance.delete<T>(url, config));
  }

  // File upload with progress
  async upload<T = unknown>(
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
      await this.get('/actuator/health');
      return true;
    } catch (error) {
      SafeLogger.error('❌ Backend health check failed:', error);
      return false;
    }
  }

  // Authentication test
  async testAuthentication(): Promise<boolean> {
    try {
      
      const testEndpoints = [
        '/api/user/me',
        '/api/users/me',
        '/api/auth/verify',
        '/api/tasks',
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          await this.get(endpoint);
          return true;
        } catch {
          // Continue to next endpoint
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