'use client';

// This middleware enhances the performance of NextAuth session handling
// by adding advanced caching behavior to reduce API calls

// Constants for cache management
const SESSION_CACHE_KEY = 'next-auth.session-cache';
const SESSION_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Type for cached session data
interface SessionCache {
  data: unknown;
  timestamp: number;
}

// Initialize global session cache 
let cachedSession: unknown = null;
let cacheTimestamp: number = 0;

// Session cache middleware for SWR global config
export function withSessionCaching<T>(fetcher: () => Promise<T>): () => Promise<T> {
  return async () => {
    // Check if we're fetching a session
    if (fetcher.toString().includes('/api/auth/session')) {
      const now = Date.now();
      
      // If we have a fresh cache, return it
      if (cachedSession && now - cacheTimestamp < SESSION_CACHE_TIME) {
        console.log('🔄 Using cached session, skipping fetch');
        return cachedSession as T;
      }
      
      // Otherwise fetch and update cache
      const data = await fetcher();
      cachedSession = data;
      cacheTimestamp = now;
      
      // Also store in sessionStorage for cross-tab persistence
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
            data: cachedSession,
            timestamp: cacheTimestamp
          }));
        } catch (_) {
          // Ignore storage errors
        }
      }
      
      return data;
    }
    
    // For non-session requests, just use the normal fetcher
    return fetcher();
  };
}

// Restore session from sessionStorage on initial load
export function initializeSessionCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached) as SessionCache;
      const now = Date.now();
      
      // Only restore if not expired
      if (now - timestamp < SESSION_CACHE_TIME) {
        cachedSession = data;
        cacheTimestamp = timestamp;
        console.log('🔄 Restored session from storage');
      }
    }
  } catch (_) {
    // Ignore storage errors
  }
}
