"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { globalSWRConfig } from '@/lib/optimizedSWRConfig'; // Sử dụng config tối ưu

interface SWRProviderProps {
  children: ReactNode;
}

// OPTIMIZED SWR Provider - giảm duplicate requests
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={globalSWRConfig}>
      {children}
    </SWRConfig>
  );
}