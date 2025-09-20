// Base API Client - Simplified version following RESTful principles
// Backend handles token refresh, frontend just makes clean API calls

import axios, { AxiosResponse, AxiosError } from 'axios';

// Configure axios instance with proper baseURL
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // HTTP-only cookies for authentication
});

// For Next.js API routes
const nextApiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Simple error handling without complex retry logic
const handleApiError = async (error: any) => {
  // Log error for debugging
  console.log('🔍 API Error:', {
    status: error?.response?.status,
    url: error?.config?.url,
    method: error?.config?.method,
  });

  // Extract meaningful error message
  let errorMessage = 'Unknown error occurred';

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data && typeof data === 'object') {
      errorMessage = data.message || data.error || data.detail || errorMessage;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }

  // Simple status-based messages
  if (errorMessage === 'Unknown error occurred') {
    switch (error.response?.status) {
      case 400:
        errorMessage = 'Bad request';
        break;
      case 401:
        errorMessage = 'Unauthorized';
        break;
      case 403:
        errorMessage = 'Forbidden';
        break;
      case 404:
        errorMessage = 'Not found';
        break;
      case 500:
        errorMessage = 'Server error';
        break;
      default:
        errorMessage = `Request failed with status ${error.response?.status || 'unknown'}`;
    }
  }

  return Promise.reject(new Error(errorMessage));
};

// Add response interceptor
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
