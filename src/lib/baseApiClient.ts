// Base API Client - Following BLOCKNOTE_NOTE_API_INTEGRATION_GUIDE.md examples
// Uses axios with withCredentials for HTTP-only cookies authentication

import axios, { AxiosResponse, AxiosError } from 'axios';

// Configure axios instance with proper baseURL
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Set to backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send HTTP-only cookies with requests
});

// For Next.js API routes
const nextApiClient = axios.create({
  baseURL: '', // Use relative URLs for Next.js API routes
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track refresh attempts to prevent infinite loops and race conditions
const retryAttempts = new Map<string, number>();
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000;

// Global refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Improved refresh auth function with race condition prevention
const refreshAuth = async (): Promise<boolean> => {
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    console.log('🔄 Auth refresh already in progress, waiting...');
    return await refreshPromise;
  }

  // Set refreshing state and create promise
  isRefreshing = true;
  refreshPromise = performRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    // Reset refresh state
    isRefreshing = false;
    refreshPromise = null;
  }
};

// Actual refresh logic separated to avoid race conditions
const performRefresh = async (): Promise<boolean> => {
  try {
    console.log('🔄 Attempting auth refresh via /api/auth/refresh...');

    // Use native fetch to avoid circular dependency with BaseApiClient
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Important: send HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Auth refresh successful - new tokens issued');

      // Add small delay to ensure cookies are properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Log the response for debugging
      try {
        const responseData = await response.json();
        console.log('✅ Refresh response:', responseData);
      } catch (e) {
        console.log('✅ Refresh successful (no JSON response)');
      }

      return true;
    } else {
      console.log('❌ Auth refresh failed with status:', response.status);

      // Log response for debugging
      try {
        const errorData = await response.text();
        console.log('❌ Refresh error response:', errorData);
      } catch (e) {
        console.log('❌ Could not read refresh error response');
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Auth refresh network error:', error);
    return false;
  }
};

// Delay function for retry mechanism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract meaningful error message from response
const getErrorMessage = (error: AxiosError): string => {
  try {
    // Handle network errors
    if (!error.response) {
      return error.code === 'NETWORK_ERROR'
        ? 'Network connection failed. Please check your internet connection.'
        : error.message || 'Network error occurred';
    }

    if (error.response?.data) {
      const data = error.response.data as any;

      // Try different error message fields from backend
      if (data.message && typeof data.message === 'string') return data.message;
      if (data.error && typeof data.error === 'string') return data.error;
      if (data.detail && typeof data.detail === 'string') return data.detail;
      if (typeof data === 'string') return data;
    }

    // Fallback to HTTP status messages
    switch (error.response?.status) {
      case 400:
        return 'Invalid request data. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict with existing data.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return error.message || `HTTP ${error.response?.status || 'Unknown'} error occurred`;
    }
  } catch (err) {
    // If anything goes wrong in error processing, return a safe fallback
    console.error('Error in getErrorMessage:', err);
    return 'An unexpected error occurred';
  }
};

// Enhanced error handling function with auto-retry on 401
const handleApiError = async (error: any) => {
  // Log the complete raw error for debugging
  console.log('🔍 Complete Raw API Error:', {
    message: error?.message,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    url: error?.config?.url,
    method: error?.config?.method,
    responseData: error?.response?.data,
    requestData: error?.config?.data
  });

  // Handle 401 errors with automatic retry
  if (error.response?.status === 401) {
    const url = error.config?.url || '';
    const requestKey = `${error.config?.method}-${url}`;

    // Silent handling for specific endpoints when not authenticated
    const silentEndpoints = ['/api/notifications/unread-count', '/api/notifications/unread', '/api/teams', '/api/projects'];

    if (silentEndpoints.some(endpoint => url.includes(endpoint))) {
      return Promise.reject(new Error('Authentication required'));
    }

    // Check retry attempts to prevent infinite loops
    const attempts = retryAttempts.get(requestKey) || 0;

    if (attempts < 1) { // Only retry once
      retryAttempts.set(requestKey, attempts + 1);

      console.log('🔄 Attempting to refresh auth and retry request...');

      // Try to refresh auth
      const refreshSuccess = await refreshAuth();

      if (refreshSuccess) {
        console.log('✅ Auth refreshed, retrying original request...');

        // Retry the original request
        try {
          const retryResponse = await apiClient.request(error.config);
          retryAttempts.delete(requestKey); // Clear retry count on success
          return retryResponse;
        } catch (retryError) {
          console.error('❌ Retry failed after auth refresh:', retryError);
          retryAttempts.delete(requestKey);
          // Fall through to normal error handling
        }
      } else {
        console.log('❌ Auth refresh failed, proceeding with logout...');
        retryAttempts.delete(requestKey);
        // Fall through to normal error handling
      }
    } else {
      console.log('❌ Max retry attempts reached for:', requestKey);
      retryAttempts.delete(requestKey);
    }
  }

  // Extract error message in order of priority
  let errorMessage = 'Unknown error occurred';

  // 1. Try to get message from response data
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data && typeof data === 'object') {
      errorMessage = data.message || data.error || data.detail || data.title || errorMessage;
    }
  }

  // 2. Try to get message from error object
  if (errorMessage === 'Unknown error occurred' && error.message) {
    errorMessage = error.message;
  }

  // 3. Try to get meaningful status-based message
  if (errorMessage === 'Unknown error occurred' || errorMessage === 'Request failed with status code 500') {
    switch (error.response?.status) {
      case 400:
        errorMessage = 'Invalid request data. Please check your input.';
        break;
      case 401:
        errorMessage = 'Authentication required. Please log in.';
        break;
      case 403:
        errorMessage = 'Access denied. You do not have permission.';
        break;
      case 404:
        errorMessage = 'Resource not found.';
        break;
      case 409:
        errorMessage = 'Conflict with existing data.';
        break;
      case 422:
        errorMessage = 'Validation error. Please check your input.';
        break;
      case 500:
        errorMessage = 'Server error. This might be a database constraint issue.';
        break;
      default:
        errorMessage = `Request failed with status ${error.response?.status || 'unknown'}`;
    }
  }

  console.error('🚨 Final Error Message:', errorMessage);

  // Return a simple error with the message
  return Promise.reject(new Error(errorMessage));
};

// Add response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  handleApiError
);

nextApiClient.interceptors.response.use(
  (response) => response,
  handleApiError
);

export class BaseApiClient {
  /**
   * GET request to backend API
   */
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request to backend API
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request to backend API
   */
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request to backend API
   */
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request to Next.js API routes
   */
  static async getFromNextApi<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await nextApiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request to Next.js API routes
   */
  static async postToNextApi<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await nextApiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request to Next.js API routes
   */
  static async putToNextApi<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await nextApiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request to Next.js API routes
   */
  static async deleteFromNextApi<T>(endpoint: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await nextApiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request with query params (for toggle actions)
   */
  static async putWithParams<T>(endpoint: string, params: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, null, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * File upload with FormData
   */
  static async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download file as Blob
   */
  static async downloadFileAsBlob(endpoint: string): Promise<Blob> {
    try {
      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download file
   */
  static async downloadFile(endpoint: string, filename: string): Promise<void> {
    try {
      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request with FormData (for file uploads) to backend API
   */
  static async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request with FormData to Next.js API routes
   */
  static async postFormDataToNextApi<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const response: AxiosResponse<T> = await nextApiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default BaseApiClient;
