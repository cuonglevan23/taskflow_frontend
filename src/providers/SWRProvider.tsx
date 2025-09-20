"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { AuthService } from '@/lib/auth-backend';

interface SWRProviderProps {
  children: ReactNode;
}

// Global fetcher function for SWR using HTTP-only cookies
const fetcher = async (key: string | string[]): Promise<any> => {
  // Transform array keys to proper URL strings
  let url: string;

  if (Array.isArray(key)) {
    // Handle array-based keys and convert to proper URLs
    const [resource, ...params] = key;

    switch (resource) {
      case 'posts':
        if (params[0] === 'feed') {
          url = `/api/posts/feed?page=${params[1] || 0}&size=${params[2] || 10}`;
        } else if (params[0] === 'user') {
          url = `/api/posts/user/${params[1]}?page=${params[2] || 0}&size=${params[3] || 10}`;
        } else if (typeof params[0] === 'number') {
          url = `/api/posts/${params[0]}`;
        } else {
          url = `/api/posts/feed?page=${params[0] || 0}&size=${params[1] || 10}`;
        }
        break;
      case 'tasks':
        if (params[0] === 'my-tasks') {
          if (params[1] === 'stats') {
            url = '/api/tasks/my-tasks/stats';
          } else if (params[1] === 'summary') {
            const queryParams = params[2] ? `?${new URLSearchParams(params[2]).toString()}` : '';
            url = `/api/tasks/my-tasks/summary${queryParams}`;
          } else {
            url = '/api/tasks/my-tasks';
          }
        } else if (params[0] === 'list') {
          url = '/api/tasks/list';
        } else {
          url = '/api/tasks';
        }
        break;
      case 'teams':
        if (params[0] === 'my-teams') {
          url = '/api/teams/my-teams';
        } else {
          url = '/api/teams';
        }
        break;
      case 'projects':
        if (params[0] === 'my-projects') {
          url = '/api/projects/my-projects';
        } else {
          url = '/api/projects';
        }
        break;
      case 'newsfeed':
        url = `/api/posts/feed?page=${params[0] || 0}&size=${params[1] || 10}`;
        break;
      default:
        url = `/${resource}`;
    }
  } else {
    // Handle string URLs directly
    url = key.startsWith('/') ? key : `/${key}`;
  }

  console.log('🔄 SWR Fetching:', url);

  try {
    // Use AuthService for authenticated requests with automatic token refresh
    const response = await AuthService.makeAuthenticatedRequest(url, {
      method: 'GET',
    });

    console.log(`📡 SWR Response for ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      // Enhanced error with more context
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        url: url,
        timestamp: new Date().toISOString()
      };

      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorData = await response.text();
        errorDetails = errorData ? ` - ${errorData}` : '';
      } catch (e) {
        // Ignore parse errors
      }

      console.error('❌ SWR HTTP Error:', errorInfo);

      // Create detailed error message
      const errorMessage = `HTTP ${response.status}: ${response.statusText} for ${url}${errorDetails}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).url = url;

      throw error;
    }

    const data = await response.json();
    console.log('✅ SWR Data received for:', url);
    return data;

  } catch (error) {
    console.error('❌ SWR Fetch failed:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Enable background revalidation for better UX
        revalidateIfStale: true,
        // Keep data fresh but don't spam the server
        focusThrottleInterval: 5000,
        // Better error handling with automatic logout on persistent 401
        onError: (error, key) => {
          console.error('SWR Error:', error, 'Key:', key);

          // If we get a 401 error and it's not a refresh token endpoint,
          // the AuthService should have already handled token refresh
          if (error?.status === 401 && !key?.toString().includes('/auth/refresh')) {
            console.log('🔒 Persistent 401 error, user session may be invalid');
            // AuthService.makeAuthenticatedRequest should have already handled this
            // but if we still get 401, it means refresh failed and user should be logged out
          }
        },
        onSuccess: (data, key) => {
          // Cache updated successfully - no logging needed
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
