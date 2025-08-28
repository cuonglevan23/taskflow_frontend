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

// Fetcher mặc định với error handling
export const defaultFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    throw error;
  }
  return response.json();
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
