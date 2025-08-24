"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface NextAuthProviderProps {
  children: ReactNode
}

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider
      // Advanced session optimization to drastically reduce API calls
      refetchInterval={600}            // Refetch only every 10 minutes
      refetchOnWindowFocus={false}     // Disable refetch on window focus
      refetchWhenOffline={false}       // Disable refetch when offline
      basePath="/api/auth"             // Explicit base path
      
      // Session optimization with stale time configuration
      // This significantly reduces /api/auth/session calls
      staleTime={10 * 60 * 1000}       // Consider data fresh for 10 minutes
      
      // Global session caching optimization
      sessionCacheTime={24 * 60 * 60 * 1000} // Cache session for 24 hours
    >
      {children}
    </SessionProvider>
  )
}