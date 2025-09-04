"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

// Global fetcher function for SWR
const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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
        // Better error handling
        onError: (error, key) => {
          console.error('SWR Error:', error, 'Key:', key);
          // Could add toast notification here
        },
        // Log successful cache updates for debugging
        onSuccess: (data, key) => {
          console.log('🔄 SWR Cache Updated:', key);
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}
