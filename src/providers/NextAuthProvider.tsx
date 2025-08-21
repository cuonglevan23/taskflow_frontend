"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface NextAuthProviderProps {
  children: ReactNode
}

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider
      // Optimize session handling to reduce API calls - NextJS 15+ optimization
      refetchInterval={0}              // Disable automatic refetch
      refetchOnWindowFocus={false}     // Disable refetch on window focus  
      refetchWhenOffline={false}       // Disable refetch when offline
      basePath="/api/auth"             // Explicit base path
      // Global session caching optimization
      session={undefined}              // Let NextAuth handle caching
    >
      {children}
    </SessionProvider>
  )
}