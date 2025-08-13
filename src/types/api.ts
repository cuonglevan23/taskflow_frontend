// Common API Types - Reusable across all services

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

// Paginated API Response
export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: boolean;
  message?: string;
}

// API Error Response
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    timestamp: string;
  };
  success: false;
  requestId?: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Request configuration
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
}

// Upload progress callback
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Download options
export interface DownloadOptions {
  filename?: string;
  mimeType?: string;
  openInNewTab?: boolean;
}

// Health check response
export interface HealthCheckResponse {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  components?: Record<string, {
    status: 'UP' | 'DOWN';
    details?: Record<string, unknown>;
  }>;
  timestamp: string;
}

// Authentication token payload (JWT)
export interface TokenPayload {
  sub: string;
  email: string;
  userId: number;
  roles: string[];
  authorities?: string[];
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

// User context (from token)
export interface UserContext {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  expiresAt: Date;
}

// API endpoints configuration
export interface ApiEndpoints {
  auth: {
    login: string;
    logout: string;
    refresh: string;
    verify: string;
    me: string;
  };
  tasks: {
    list: string;
    create: string;
    detail: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
    assign: (id: string) => string;
    status: (id: string) => string;
    bulk: string;
    stats: string;
  };
  projects: {
    list: string;
    detail: (id: string) => string;
    tasks: (id: string) => string;
  };
  users: {
    list: string;
    profile: (id: string) => string;
    me: string;
  };
  health: string;
}

// Request interceptor context
export interface RequestInterceptorContext {
  token?: string;
  userContext?: UserContext;
  requestId: string;
  timestamp: Date;
}

// Response interceptor context  
export interface ResponseInterceptorContext {
  requestId: string;
  duration: number;
  success: boolean;
  status: number;
  url: string;
  method: HttpMethod;
}

// API client interface
export interface ApiClient {
  get<T = unknown>(url: string, config?: Record<string, unknown>): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>;
  delete<T = unknown>(url: string, config?: Record<string, unknown>): Promise<T>;
  upload<T = unknown>(url: string, file: File | FormData, onProgress?: (progress: UploadProgress) => void): Promise<T>;
  download(url: string, options?: DownloadOptions): Promise<void>;
}

// Error codes
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number;
  strategy: 'memory' | 'localStorage' | 'sessionStorage';
}

// Rate limiting configuration
export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  timeWindow: number; // in seconds
  retryAfter?: number; // in seconds
}

// Service configuration combining all aspects
export interface ServiceConfig {
  api: ApiConfig;
  cache?: CacheConfig;
  rateLimit?: RateLimitConfig;
  endpoints: ApiEndpoints;
  debug: boolean;
}

// Export utility types
export type ApiMethod<T = unknown> = (...args: unknown[]) => Promise<T>;
export type ApiMethodWithParams<P, T> = (params: P) => Promise<T>;
export type ApiMethodWithBody<B, T> = (body: B) => Promise<T>;
export type ApiMethodWithParamsAndBody<P, B, T> = (params: P, body: B) => Promise<T>;