"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { sessionService, sessionUtils } from '@/services/sessionService';

// Session context interface
interface SessionContextValue {
  data: unknown;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<unknown>;
}

// Create context
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Provider component - SINGLE SOURCE OF TRUTH cho session
export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, error, isLoading, mutate } = sessionService.useSession();

  const status: 'loading' | 'authenticated' | 'unauthenticated' = 
    isLoading ? 'loading' : 
    error ? 'unauthenticated' : 
    sessionUtils.isAuthenticated(session) ? 'authenticated' : 'unauthenticated';

  const value = {
    data: session,
    status,
    isLoading,
    error,
    mutate, // For manual refresh if needed
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// UNIFIED HOOK - thay thế tất cả useSession và useSessionSWR
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Legacy compatibility - sẽ được deprecated
export const useSessionSWR = useSession;
