/**
 * Session Service - Centralized session management
 * 
 * Thay thế tất cả các cách gọi /api/auth/session trực tiếp
 * Tận dụng SWR cache để tránh duplicate requests
 */

import useSWR, { mutate } from 'swr';
import { sessionSWRConfig, defaultFetcher } from '@/lib/optimizedSWRConfig';

// Session cache key - consistent across app
export const SESSION_CACHE_KEY = '/api/auth/session';

// Session service với SWR
export const sessionService = {
  /**
   * Hook để lấy session data - SINGLE SOURCE OF TRUTH
   */
  useSession: () => {
    return useSWR(SESSION_CACHE_KEY, defaultFetcher, sessionSWRConfig);
  },

  /**
   * Manually refresh session
   */
  refreshSession: async () => {
    return mutate(SESSION_CACHE_KEY);
  },

  /**
   * Clear session cache
   */
  clearSession: () => {
    mutate(SESSION_CACHE_KEY, null, false);
  },

  /**
   * Preload session data
   */
  preloadSession: async () => {
    return mutate(SESSION_CACHE_KEY, defaultFetcher(SESSION_CACHE_KEY), false);
  },

  /**
   * Get current cached session without triggering fetch
   */
  getCachedSession: () => {
    return mutate(SESSION_CACHE_KEY, undefined, { revalidate: false });
  },
};

// Utility functions for session
export const sessionUtils = {
  /**
   * Check if user is authenticated from session data
   */
  isAuthenticated: (sessionData: unknown) => {
    return !!(sessionData && typeof sessionData === 'object' && 'user' in sessionData);
  },

  /**
   * Extract user from session data safely
   */
  getUser: (sessionData: unknown) => {
    if (sessionUtils.isAuthenticated(sessionData)) {
      return (sessionData as { user: unknown }).user;
    }
    return null;
  },

  /**
   * Extract access token from session
   */
  getAccessToken: (sessionData: unknown) => {
    const user = sessionUtils.getUser(sessionData);
    if (user && typeof user === 'object' && 'accessToken' in user) {
      return (user as { accessToken: string }).accessToken;
    }
    return null;
  },
};
