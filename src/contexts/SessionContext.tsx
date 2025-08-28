"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession as useNextAuthSession } from 'next-auth/react';
import { sessionService, sessionUtils } from '@/services/sessionService';

// Session context interface
interface SessionContextValue {
  data: unknown;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<unknown>;
  update: () => Promise<unknown>;
}

// Create context
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

// Provider component - SINGLE SOURCE OF TRUTH cho session
export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, error, isLoading, mutate } = sessionService.useSession();
  const { data: nextAuthSession, status: nextAuthStatus, update } = useNextAuthSession();

  // Simple status determination
  const status: 'loading' | 'authenticated' | 'unauthenticated' =
    isLoading || nextAuthStatus === 'loading' ? 'loading' :
    nextAuthSession ? 'authenticated' : 'unauthenticated';

  const value = {
    data: nextAuthSession || session, // Prefer NextAuth session
    status,
    isLoading: isLoading || nextAuthStatus === 'loading',
    error,
    mutate,
    update,
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
