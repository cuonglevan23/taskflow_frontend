"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { UserRole, Permission } from "@/constants/auth"
import * as authUtils from "@/lib/utils/auth"
import type { AuthUser } from "@/lib/auth/types"

export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (provider?: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

// Cache session check for performance
let lastStatusCheck = 0;
let cachedStatus: 'authenticated' | 'unauthenticated' | 'loading' = 'loading';
const STATUS_CACHE_TIME = 60 * 1000; // 1 minute

export function useAuth(): UseAuthReturn {
  // Use session with optimized caching strategy
  const { data: session, status } = useSession({
    required: false,
  });
  
  // Cache the status for multiple components using useAuth
  const now = Date.now();
  if (now - lastStatusCheck > STATUS_CACHE_TIME) {
    cachedStatus = status;
    lastStatusCheck = now;
  }
  
  const user = session?.user || null
  const isLoading = cachedStatus === "loading"
  const isAuthenticated = !!session?.user

  const login = async (provider: string = "google") => {
    // For backend OAuth, redirect to backend instead of NextAuth
    if (provider === "google") {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      window.location.href = `${apiUrl}/api/auth/google`
      return
    }
    
    await signIn(provider, { callbackUrl: "/home" })
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const hasPermission = (permission: Permission): boolean => {
    return authUtils.hasPermission(user, permission)
  }

  const hasRole = (role: UserRole): boolean => {
    return authUtils.hasRole(user, role)
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authUtils.hasAnyRole(user, roles)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
  }
}