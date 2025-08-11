/**
 * Role-Based Access Control Hook
 * Hook để sử dụng RBAC trong React components
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createRBACHelper, hasPermission, hasAnyPermission, hasAllPermissions, canAccessRoute } from '@/utils/rbac';
import { UserRole, Permission } from '@/constants/auth';
import type { UserWithRole } from '@/types/roles';

export interface UseRBACReturn {
  // User info
  user: UserWithRole | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  
  // RBAC Helper instance
  rbac: ReturnType<typeof createRBACHelper>;
  
  // Role checks
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isProjectManager: boolean;
  isLeader: boolean;
  isMember: boolean;
  isGuest: boolean;
  
  // Permission methods
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  canAccess: (allowedRoles: UserRole[], requiredPermissions?: Permission[]) => boolean;
  
  // Management capabilities
  canManageWorkspace: boolean;
  canManageUsers: boolean;
  canCreateProjects: boolean;
  canManageTeams: boolean;
  canViewReports: boolean;
  canManageBilling: boolean;
  canInviteUsers: boolean;
  canDeleteProjects: boolean;
  canManageSystem: boolean;
  
  // Utility methods
  hasMinRole: (minimumRole: UserRole) => boolean;
  debug: () => void;
}

/**
 * Main RBAC hook - sử dụng trong components để kiểm tra quyền
 */
export function useRBAC(): UseRBACReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Tạo RBAC helper với memoization để tránh re-create không cần thiết
  const rbac = useMemo(() => createRBACHelper(user), [user]);
  
  // Extract role với error handling
  const role = useMemo(() => {
    if (!user?.role) return null;
    
    // Handle both new and legacy role formats
    if (typeof user.role === 'string') {
      return user.role as UserRole;
    }
    
    return null;
  }, [user?.role]);
  
  // Memoize all permission checks
  const permissionChecks = useMemo(() => ({
    canManageWorkspace: rbac.canManageWorkspace,
    canManageUsers: rbac.canManageUsers,
    canCreateProjects: rbac.canCreateProjects,
    canManageTeams: rbac.canManageTeams,
    canViewReports: rbac.canViewReports,
    canManageBilling: rbac.canManageBilling,
    canInviteUsers: rbac.can(Permission.INVITE_USERS),
    canDeleteProjects: rbac.can(Permission.DELETE_PROJECT),
    canManageSystem: rbac.can(Permission.MANAGE_SYSTEM),
  }), [rbac]);
  
  // Memoize role checks
  const roleChecks = useMemo(() => ({
    isSuperAdmin: rbac.isSuperAdmin,
    isAdmin: rbac.isAdmin,
    isOwner: rbac.isOwner,
    isProjectManager: rbac.isProjectManager,
    isLeader: rbac.isLeader,
    isMember: rbac.isMember,
    isGuest: rbac.isGuest,
  }), [rbac]);
  
  // Memoize utility functions
  const utilityMethods = useMemo(() => ({
    can: (permission: Permission) => hasPermission(user, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(user, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(user, permissions),
    canAccess: (allowedRoles: UserRole[], requiredPermissions: Permission[] = []) => 
      canAccessRoute(user, allowedRoles, requiredPermissions),
    hasMinRole: (minimumRole: UserRole) => rbac.hasMinRole(minimumRole),
    debug: () => {
      console.group('🔐 RBAC Debug Info');
      console.log('User:', user);
      console.log('Role:', role);
      console.log('Is Authenticated:', isAuthenticated);
      console.log('Role Checks:', roleChecks);
      console.log('Permission Checks:', permissionChecks);
      console.groupEnd();
    },
  }), [user, role, isAuthenticated, roleChecks, permissionChecks, rbac]);
  
  return {
    // User info
    user,
    role,
    isAuthenticated,
    
    // RBAC Helper
    rbac,
    
    // Role checks
    ...roleChecks,
    
    // Permission checks
    ...permissionChecks,
    
    // Utility methods
    ...utilityMethods,
  };
}

/**
 * Hook để kiểm tra một permission cụ thể
 */
export function usePermission(permission: Permission): boolean {
  const { can } = useRBAC();
  return can(permission);
}

/**
 * Hook để kiểm tra nhiều permissions
 */
export function usePermissions(permissions: Permission[]): {
  hasAny: boolean;
  hasAll: boolean;
  results: Record<string, boolean>;
} {
  const { can, canAny, canAll } = useRBAC();
  
  const results = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      acc[permission] = can(permission);
      return acc;
    }, {} as Record<string, boolean>);
  }, [permissions, can]);
  
  return {
    hasAny: canAny(permissions),
    hasAll: canAll(permissions),
    results,
  };
}

/**
 * Hook để kiểm tra role cụ thể
 */
export function useRole(targetRole: UserRole): boolean {
  const { role } = useRBAC();
  return role === targetRole;
}

/**
 * Hook để kiểm tra minimum role
 */
export function useMinimumRole(minimumRole: UserRole): boolean {
  const { hasMinRole } = useRBAC();
  return hasMinRole(minimumRole);
}

/**
 * Hook để get navigation items dựa trên role
 */
export function useRoleBasedNavigation() {
  const { user, canAccess } = useRBAC();
  
  const filterNavigationByRole = useMemo(() => {
    return <T extends { allowedRoles?: UserRole[]; requiredPermissions?: Permission[] }>(
      items: T[]
    ): T[] => {
      return items.filter(item => {
        if (!item.allowedRoles) return true;
        return canAccess(item.allowedRoles, item.requiredPermissions || []);
      });
    };
  }, [canAccess]);
  
  return {
    user,
    filterNavigationByRole,
  };
}