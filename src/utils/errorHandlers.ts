import { AxiosError } from 'axios';

/**
 * Safe error logger for Axios errors
 * Type-safe way to log Axios errors without TS warnings
 */
export function logAxiosError(error: unknown): void {
  // Try to cast to AxiosError if possible
  const axiosError = error as AxiosError;
  
  console.error('API Error:', error);
  
  if (axiosError.response) {
    // The request was made and the server responded with a status code
    console.error('Error Response:', {
      status: axiosError.response.status,
      data: axiosError.response.data,
      headers: axiosError.response.headers
    });
  } else if (axiosError.request) {
    // The request was made but no response was received
    console.error('Error Request:', axiosError.request);
  } else if (axiosError.message) {
    // Something happened in setting up the request
    console.error('Error Message:', axiosError.message);
  }
}
