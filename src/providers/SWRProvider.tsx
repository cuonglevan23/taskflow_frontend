"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

// Global SWR configuration following v1f guidelines
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global fetcher - will be overridden by individual hooks
        fetcher: async (url: string) => {
          const response = await fetch(url);
          if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            throw error;
          }
          return response.json();
        },
        
        // v1f recommended configuration
        revalidateOnFocus: true,            // Enable focus revalidation as per v1f
        revalidateOnReconnect: true,        // Enable reconnect revalidation
        dedupingInterval: 2000,             // 2 seconds as per v1f
        
        // Error retry configuration
        errorRetryInterval: 5000,           // 5 seconds
        errorRetryCount: 3,
        
        // Background revalidation
        refreshInterval: 0,                 // Disable by default, enable per hook as needed
        
        // Cache configuration
        shouldRetryOnError: true,
        keepPreviousData: true,             // Keep previous data during revalidation
        
        // Fallback data
        fallback: {},
        
        // Error handling
        onError: (error, key) => {
          console.error('SWR Error:', { error, key });
          
          // You can add global error reporting here
          // e.g., send to error tracking service
        },
        
        // Success callback
        onSuccess: (data, key) => {
          // Optional: Global success logging
          if (process.env.NODE_ENV === 'development') {
            console.log('SWR Success:', { key, data });
          }
        },
        
        // Network optimization
        loadingTimeout: 5000,               // 5 second timeout
        
        // Next.js 15+ optimizations
        suspense: false,                    // Disable suspense for better control
      }}
    >
      {children}
    </SWRConfig>
  );
}