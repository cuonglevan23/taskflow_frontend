"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

// Global SWR configuration optimized for Next.js 15+
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Cache optimization
        revalidateOnFocus: false,           // Disable focus revalidation globally
        revalidateOnReconnect: false,       // Disable reconnect revalidation
        revalidateIfStale: false,           // Disable stale revalidation
        
        // Deduplication settings - Aggressive caching for team data
        dedupingInterval: 300000,           // 5 minutes global deduping for team data persistence
        
        // Error handling
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        
        // Performance optimizations
        refreshInterval: 0,                 // Disable auto refresh
        keepPreviousData: true,             // Keep previous data during revalidation
        
        // Network optimization
        loadingTimeout: 5000,               // 5 second timeout
        
        // Next.js 15+ optimizations
        suspense: false,                    // Disable suspense for better control
        
        // Global fetcher with better error handling
        fetcher: (url: string) => {
          // This won't be used as we have specific fetchers in services
          // But good to have as fallback
          return fetch(url).then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          });
        },
        
        // Performance monitoring (can be removed in production)
        onSuccess: (data, key) => {
          // Success logging removed for cleaner console
        },
        
        onError: (error, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`❌ SWR Error: ${Array.isArray(key) ? key.join(',') : key}`, error);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}