'use client';

import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

// Simple API client for NextAuth integration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Create API instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor to add NextAuth session token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      console.log('🔍 Session debug:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasAccessToken: !!session?.user?.accessToken,
        accessToken: session?.user?.accessToken?.substring(0, 20) + '...' // Only show first 20 chars for security
      });

      if (session?.user?.accessToken && config.headers) {
        config.headers['Authorization'] = `Bearer ${session.user.accessToken}`;
        console.log('✅ Added auth header to request:', config.url);
      } else {
        console.warn('⚠️ No access token found in session for request:', config.url);
      }
    } catch (error) {
      console.warn('Failed to get session for API request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Authentication failed - please sign in again');
      // You could redirect to login here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
