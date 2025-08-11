"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { UserRole, Permission } from "@/constants/auth"

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: UserRole
  permissions: string[]
}

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
  const { data: session, status } = useSession()
  
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
    if (!user?.permissions) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (role: UserRole): boolean => {
    if (!user?.role) return false
    return user.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user?.role) return false
    return roles.includes(user.role)
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