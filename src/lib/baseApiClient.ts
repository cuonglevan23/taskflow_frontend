// Base API Client - Following BLOCKNOTE_NOTE_API_INTEGRATION_GUIDE.md examples
// Uses axios with withCredentials for HTTP-only cookies authentication

import axios, { AxiosResponse, AxiosError } from 'axios';

// Configure axios instance exactly like docs examples
const apiClient = axios.create({
  baseURL: '', // Use relative URLs for Next.js proxy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send HTTP-only cookies with requests
});

// Enhanced error handling function
const handleApiError = (error: AxiosError) => {
  console.error('🚨 API Error:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
  });

  if (error.response?.status === 401) {
    console.error('🔒 Authentication required - redirecting to login');
    window.location.href = '/auth/login';
    return Promise.reject(new Error('Authentication required'));
  }

  // Extract error message from backend response
  const errorMessage = getErrorMessage(error);
  return Promise.reject(new Error(errorMessage));
};

// Extract meaningful error message from response
const getErrorMessage = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as any;

    // Try different error message fields from backend
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
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
      return error.message || 'An unexpected error occurred.';
  }
};

// Add response interceptor for handling auth errors (from docs)
apiClient.interceptors.response.use(
  (response) => response,
  handleApiError
);

export class BaseApiClient {
  /**
   * GET request - Following docs pattern with enhanced error handling
   */
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    console.log(`🌐 API Request: GET ${endpoint}`, params);

    try {
      const response: AxiosResponse<T> = await apiClient.get(endpoint, { params });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * POST request - Following docs pattern with enhanced error handling
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`🔄 POST request to: ${endpoint}`, data);

    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, data);
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PUT request - Following docs pattern with enhanced error handling
   */
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`🔄 PUT request to: ${endpoint}`, data);

    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, data);
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * DELETE request - Following docs pattern with enhanced error handling
   */
  static async delete<T>(endpoint: string): Promise<T> {
    console.log(`🗑️ DELETE request to: ${endpoint}`);

    try {
      const response: AxiosResponse<T> = await apiClient.delete(endpoint);
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PUT request with query params (for toggle actions) - Following docs pattern
   */
  static async putWithParams<T>(endpoint: string, params: Record<string, any>): Promise<T> {
    console.log(`🔄 PUT request to: ${endpoint}`, params);

    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, null, { params });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ PUT ${endpoint} with params failed:`, error);
      throw error;
    }
  }

  /**
   * File upload with FormData - Following docs pattern
   */
  static async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    console.log(`📤 File upload to: ${endpoint}`);

    const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Upload Response:', response.data);
    return response.data;
  }

  /**
   * Download file - Following docs pattern
   */
  static async downloadFile(endpoint: string, filename: string): Promise<void> {
    console.log(`📥 Downloading file from: ${endpoint}`);

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
  }
}

export default BaseApiClient;
