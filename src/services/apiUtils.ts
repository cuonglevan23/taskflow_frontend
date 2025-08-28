// API Utilities - Error handling, retry logic, and fallbacks
import { api } from './api';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delay: 1000, // 1 second
  backoffMultiplier: 2,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500);
  }
};

// Sleep utility
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Retry with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: AxiosError | Error;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as AxiosError | Error;

      // Don't retry if it's the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }

      // Check if we should retry based on the error
      if (finalConfig.retryCondition && !finalConfig.retryCondition(lastError as AxiosError)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = finalConfig.delay * Math.pow(finalConfig.backoffMultiplier, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError!;
}

// Safe API response handler
export function handleApiResponse<T>(response: AxiosResponse<T>): T {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(`API request failed with status ${response.status}`);
  }
}

// Error message extractor
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const axiosError = error as AxiosError;
  if (axiosError.response?.data) {
    const errorData = axiosError.response.data as { message?: string; error?: string };
    return errorData.message || errorData.error || 'An unexpected error occurred';
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  return 'An unexpected error occurred';
}

// Backend error response type
interface BackendErrorResponse {
  message?: string;
  error?: string;
  messages?: string[];
  status?: number;
}

// Enhanced error handler for backend responses
export function handleBackendError(error: AxiosError): never {
  const response = error.response;

  if (response) {
    const errorData = response.data as BackendErrorResponse;
    const status = response.status;
    const statusText = response.statusText;

    // Extract error message
    let message = 'Unknown error';
    if (errorData.messages && errorData.messages.length > 0) {
      message = errorData.messages.join(', ');
    } else if (errorData.message) {
      message = errorData.message;
    } else if (errorData.error) {
      message = errorData.error;
    }

    console.error(`❌ Backend error: ${status} ${JSON.stringify(errorData)}`);

    // Create detailed error object
    const detailedError = new Error(message) as Error & {
      status: number;
      statusText: string;
      url: string;
      errorText: string;
      headers: Record<string, string>;
    };

    detailedError.status = status;
    detailedError.statusText = statusText;
    detailedError.url = response.config?.url || 'unknown';
    detailedError.errorText = JSON.stringify(errorData);
    detailedError.headers = response.headers as Record<string, string>;

    throw detailedError;
  } else if (error.request) {
    console.error('❌ Network error - no response received:', error.message);
    throw new Error('Network error: Unable to connect to server');
  } else {
    console.error('❌ Request setup error:', error.message);
    throw new Error(`Request error: ${error.message}`);
  }
}

// Safe API client with proper typing
export const safeApi = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return withRetry(async () => {
      const response = await api.get<T>(url, config);
      return handleApiResponse(response);
    });
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return withRetry(async () => {
      const response = await api.post<T>(url, data, config);
      return handleApiResponse(response);
    });
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return withRetry(async () => {
      const response = await api.put<T>(url, data, config);
      return handleApiResponse(response);
    });
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return withRetry(async () => {
      const response = await api.patch<T>(url, data, config);
      return handleApiResponse(response);
    });
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return withRetry(async () => {
      const response = await api.delete<T>(url, config);
      return handleApiResponse(response);
    });
  }
};