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

// Enhanced error handling function
const handleApiError = (error: AxiosError) => {
  try {
    // Only redirect on 401 errors from main API calls, not Next.js API routes
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/api/')) {
      // Check if we're already on the login page to prevent redirect loops
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('Authentication required. Redirecting to login...');
        window.location.replace('/login');
      }
      return Promise.reject(new Error('Authentication required'));
    }

    // Extract error message from backend response with safe fallback
    let errorMessage = 'An unexpected error occurred';
    try {
      const extractedMessage = getErrorMessage(error);
      if (extractedMessage && typeof extractedMessage === 'string') {
        errorMessage = extractedMessage;
      }
    } catch (err) {
      console.error('Failed to get error message:', err);
    }

    return Promise.reject(new Error(errorMessage));
  } catch (err) {
    console.error('Error in handleApiError:', err);
    return Promise.reject(new Error('An unexpected error occurred'));
  }
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
