/**
 * Role-Based Access Control Hook
 * Hook để sử dụng RBAC trong React components
 */

import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserRole, ROLE_PERMISSIONS, type Permission } from '@/constants/auth';

export interface UseRBACReturn {
  // User info
  user: UserWithRole | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  
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
  const { user, isLoading } = useAuth();

  const isAuthenticated = !!user;

  // Extract role với error handling
  const role = useMemo(() => {
    if (!user?.role) return null;
    
    // Handle both new and legacy role formats
    if (typeof user.role === 'string') {
      return user.role as UserRole;
    }
    
    return null;
  }, [user?.role]);
  
  // Tạo RBAC helper với memoization để tránh re-create không cần thiết
  const permissions = useMemo(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  const hasRole = useMemo(() =>
    (role: UserRole) => role === role,
    [role]
  );

  const hasPermission = useMemo(() =>
    (permission: Permission) => permissions.includes(permission),
    [permissions]
  );

  const canAccess = useMemo(() =>
    (allowedRoles: UserRole[], requiredPermissions: Permission[] = []) =>
      allowedRoles.includes(role as UserRole) && requiredPermissions.every(permission => permissions.includes(permission)),
    [role, permissions]
  );

  // Memoize all permission checks
  const permissionChecks = useMemo(() => ({
    canManageWorkspace: hasPermission('workspace:manage'),
    canManageUsers: hasPermission('users:manage'),
    canCreateProjects: hasPermission('projects:create'),
    canManageTeams: hasPermission('teams:manage'),
    canViewReports: hasPermission('reports:view'),
    canManageBilling: hasPermission('billing:manage'),
    canInviteUsers: hasPermission('users:invite'),
    canDeleteProjects: hasPermission('projects:delete'),
    canManageSystem: hasPermission('system:manage'),
  }), [hasPermission]);

  // Memoize role checks
  const roleChecks = useMemo(() => ({
    isSuperAdmin: hasRole(UserRole.SUPER_ADMIN),
    isAdmin: hasRole(UserRole.ADMIN),
    isOwner: hasRole(UserRole.OWNER),
    isProjectManager: hasRole(UserRole.PROJECT_MANAGER),
    isLeader: hasRole(UserRole.LEADER),
    isMember: hasRole(UserRole.MEMBER),
    isGuest: hasRole(UserRole.GUEST),
  }), [hasRole]);

  // Memoize utility functions
  const utilityMethods = useMemo(() => ({
    can: (permission: Permission) => hasPermission(permission),
    canAny: (permissions: Permission[]) => permissions.some(permission => hasPermission(permission)),
    canAll: (permissions: Permission[]) => permissions.every(permission => hasPermission(permission)),
    canAccess: (allowedRoles: UserRole[], requiredPermissions: Permission[] = []) =>
      canAccess(allowedRoles, requiredPermissions),
    hasMinRole: (minimumRole: UserRole) => hasRole(minimumRole),
    debug: () => {
      console.group('🔐 RBAC Debug Info');
      console.log('User:', user);
      console.log('Role:', role);
      console.log('Is Authenticated:', isAuthenticated);
      console.log('Role Checks:', roleChecks);
      console.log('Permission Checks:', permissionChecks);
      console.groupEnd();
    },
  }), [user, role, isAuthenticated, roleChecks, permissionChecks]);

  return {
    // User info
    user,
    role,
    isAuthenticated,
    
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