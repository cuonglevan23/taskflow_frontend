/**
 * SWR Configuration tối ưu hóa - GIẢM DUPLICATE REQUESTS
 * 
 * Cấu hình này sẽ:
 * 1. Dedup các requests giống nhau
 * 2. Aggressive caching để tránh re-fetch không cần thiết
 * 3. Centralized error handling
 * 4. Optimistic updates
 */

import { SWRConfiguration } from 'swr';

// Fetcher mặc định với error handling cải tiến
export const defaultFetcher = async (url: string) => {
  // Validate URL trước khi fetch
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided to fetcher');
  }

  // Check if URL is properly formatted
  try {
    new URL(url, window.location.origin);
  } catch (e) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Tạo error message chi tiết hơn
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);

      // Log chi tiết lỗi để debug
      console.error('SWR Fetch Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });

      // Attach thêm thông tin cho error handling
      (error as any).status = response.status;
      (error as any).url = url;

      throw error;
    }

    return response.json();
  } catch (error) {
    // Log network errors hoặc JSON parsing errors
    console.error('SWR Network/Parse Error:', {
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// SWR config tối ưu hóa cho session
export const sessionSWRConfig: SWRConfiguration = {
  dedupingInterval: 300000, // 5 minutes - aggressive dedup
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateIfStale: false,
  errorRetryCount: 1,
  errorRetryInterval: 10000,
  focusThrottleInterval: 300000,
  keepPreviousData: true,
  fetcher: defaultFetcher,
};

// SWR config cho API calls thông thường
export const apiSWRConfig: SWRConfiguration = {
  dedupingInterval: 60000, // 1 minute dedup
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateIfStale: true,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
  focusThrottleInterval: 60000,
  keepPreviousData: true,
  fetcher: defaultFetcher,
};

// SWR config cho real-time data (ít aggressive caching)
export const realTimeSWRConfig: SWRConfiguration = {
  dedupingInterval: 10000, // 10 seconds
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateIfStale: true,
  errorRetryCount: 3,
  errorRetryInterval: 2000,
  focusThrottleInterval: 10000,
  refreshInterval: 30000, // Refresh mỗi 30s cho real-time data
  fetcher: defaultFetcher,
};

// Global SWR config - áp dụng cho toàn bộ app
export const globalSWRConfig: SWRConfiguration = {
  ...apiSWRConfig,
  // Override để tránh duplicate session calls
  fallback: {},
  onError: (error) => {
    console.error('SWR Error:', error);
    // Có thể thêm error tracking ở đây
  },
  onSuccess: () => {
    // Success handler - can add analytics here if needed
  },
};
