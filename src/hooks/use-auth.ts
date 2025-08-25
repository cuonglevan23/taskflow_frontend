"use client"

import { useOptimizedSession } from "./useOptimizedSession" // Tối ưu session
import { signIn, signOut } from "next-auth/react"
import { UserRole, Permission } from "@/constants/auth"

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

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useOptimizedSession() // Sử dụng session tối ưu
  
  const user = session?.user || null
  const isLoading = status === "loading"
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
    return require("@/lib/utils/auth").hasPermission(user, permission)
  }

  const hasRole = (role: UserRole): boolean => {
    return require("@/lib/utils/auth").hasRole(user, role)
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return require("@/lib/utils/auth").hasAnyRole(user, roles)
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