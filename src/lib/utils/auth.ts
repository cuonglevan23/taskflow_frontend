// Authentication utility functions
import { UserRole, Permission, ROLE_PERMISSIONS } from "@/constants/auth"
import type { AuthUser } from "@/lib/auth/types"

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser | UserProfile | null, permission: Permission): boolean {
  if (!user?.permissions) return false
  return user.permissions.includes(permission)
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | UserProfile | null, role: UserRole): boolean {
  if (!user?.role) return false
  return user.role === role
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | UserProfile | null, roles: UserRole[]): boolean {
  if (!user?.role) return false
  return roles.includes(user.role)
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if role has higher or equal priority than another role
 */
export function hasRolePriority(userRole: UserRole, requiredRole: UserRole): boolean {
  const rolePriority = {
    [UserRole.GUEST]: 0,
    [UserRole.MEMBER]: 1,
    [UserRole.LEADER]: 2,
    [UserRole.PM]: 3,
    [UserRole.OWNER]: 4,
    [UserRole.ADMIN]: 5,
    [UserRole.SUPER_ADMIN]: 6,
  }
  
  return rolePriority[userRole] >= rolePriority[requiredRole]
}

/**
 * Format user display name
 */
export function formatUserName(user: AuthUser | null): string {
  if (!user) return "Guest"
  return user.name || user.email || "Unknown User"
}

/**
 * Get user avatar URL or initials
 */
export function getUserAvatar(user: AuthUser | null): { url?: string; initials: string } {
  if (!user) return { initials: "G" }
  
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U"
  
  return {
    url: user.image || undefined,
    initials
  }
}