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
   * Manually refresh session - enhanced for OAuth callback
   */
  refreshSession: async () => {
    console.log('🔄 Force refreshing session cache...');
    // Force revalidate với fresh fetch
    const result = await mutate(SESSION_CACHE_KEY, undefined, {
      revalidate: true,
      populateCache: true,
      optimisticData: undefined
    });
    console.log('✅ Session cache refreshed');
    return result;
  },

  /**
   * Clear session cache
   */
  clearSession: () => {
    console.log('🗑️ Clearing session cache...');
    mutate(SESSION_CACHE_KEY, null, false);
  },

  /**
   * Force refresh after OAuth - aggressive cache invalidation
   */
  forceRefreshAfterOAuth: async () => {
    console.log('🔄 Force refresh after OAuth...');

    // Clear cache first
    mutate(SESSION_CACHE_KEY, undefined, { revalidate: false });

    // Then force fresh fetch
    const result = await mutate(SESSION_CACHE_KEY,
      defaultFetcher(SESSION_CACHE_KEY),
      {
        revalidate: true,
        populateCache: true
      }
    );

    console.log('✅ OAuth session refresh completed');
    return result;
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
