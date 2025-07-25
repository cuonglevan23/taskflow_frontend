// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Common API request types
export interface CreateRequest<T = Record<string, unknown>> {
  data: T;
}

export interface UpdateRequest<T = Record<string, unknown>> {
  id: string;
  data: Partial<T>;
}

export interface DeleteRequest {
  id: string;
}

export interface GetByIdRequest {
  id: string;
}

export interface ListRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API request configuration
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
}

// API hook return type
export interface ApiHookReturn<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Mutation hook return type
export interface MutationHookReturn<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
}

// Query parameters for lists
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// File upload types
export interface FileUploadResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
} 