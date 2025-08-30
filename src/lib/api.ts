// Centralized API Client - Backend JWT Authentication Only
import axios, {
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosProgressEvent
} from 'axios';
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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important: include HTTP-only cookies
  maxRetries: 2,
  retryDelay: 1000,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 30000,
};

// Error normalization interface
interface NormalizedError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  isConnectionError?: boolean;
  isServerError?: boolean;
  userMessage?: string;
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
    // Request Interceptor - Simple, no manual token management
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        // HTTP-only cookies sẽ tự động được gửi kèm với withCredentials: true
        SafeLogger.debug('🔄 API Request:', config.method?.toUpperCase(), config.url);

        // Special handling for FormData - only remove Content-Type, keep other headers
        if (config.data instanceof FormData) {
          // Only remove Content-Type header to let browser set it with boundary
          // Keep all other headers including authentication headers
          if (config.headers && config.headers['Content-Type']) {
            delete config.headers['Content-Type'];
          }
          SafeLogger.debug('📋 FormData request detected - removed Content-Type, keeping other headers');
        }

        return config;
      },
      (error) => {
        SafeLogger.error('❌ Request interceptor error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Response Interceptor - Handle authentication errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        // Reset circuit breaker on successful response
        this.resetCircuitBreaker();
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const normalizedError = this.normalizeError(error);
        
        // Handle authentication errors
        if (normalizedError.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          SafeLogger.warn('🔄 Token expired, attempting refresh...');

          try {
            // Gọi refresh endpoint - backend sẽ handle cookie refresh
            const refreshResponse = await fetch(`${this.config.baseURL}/api/auth/refresh`, {
              method: 'POST',
              credentials: 'include', // Include HTTP-only cookies
            });

            if (refreshResponse.ok) {
              SafeLogger.info('✅ Token refreshed successfully');
              // Retry original request
              return this.instance(originalRequest);
            } else {
              SafeLogger.warn('❌ Token refresh failed, redirecting to login');
              window.location.href = '/login';
              return Promise.reject(normalizedError);
            }
          } catch (refreshError) {
            SafeLogger.error('❌ Token refresh error:', refreshError);
            window.location.href = '/login';
            return Promise.reject(normalizedError);
          }
        }

        // Update circuit breaker on network errors
        if (!normalizedError.status || normalizedError.status >= 500 || normalizedError.isConnectionError) {
          this.recordFailure();
        }
        
        // Handle other error cases
        if (normalizedError.status === 403) {
          SafeLogger.error('🚨 403 Forbidden - Check user permissions');
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
        '/api/auth/check',
        '/api/users/me',
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
  healthCheck: apiClient.healthCheck.bind(apiClient),
  testAuthentication: apiClient.testAuthentication.bind(apiClient),
};

// Default export
export default api;
