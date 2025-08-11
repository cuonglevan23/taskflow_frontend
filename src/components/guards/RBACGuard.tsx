/**
 * Role-Based Access Control Guard Components
 * Bảo vệ UI elements và routes dựa trên roles và permissions
 */

import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole, Permission } from '@/constants/auth';

// Base interface for all guard props
interface BaseGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

// Permission-based guard props
interface PermissionGuardProps extends BaseGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // true = AND, false = OR
}

// Role-based guard props
interface RoleGuardProps extends BaseGuardProps {
  role?: UserRole;
  roles?: UserRole[];
  minimumRole?: UserRole;
}

// Combined guard props
interface RBACGuardProps extends BaseGuardProps {
  // Role checks
  role?: UserRole;
  roles?: UserRole[];
  minimumRole?: UserRole;
  
  // Permission checks  
  permission?: Permission;
  permissions?: Permission[];
  requireAllPermissions?: boolean;
  
  // Advanced options
  requireAuthentication?: boolean;
  allowUnauthenticated?: boolean;
  debug?: boolean;
}

/**
 * Main RBAC Guard - kiểm tra role và permissions
 */
export function RBACGuard({
  children,
  fallback = null,
  showFallback = true,
  role,
  roles,
  minimumRole,
  permission,
  permissions,
  requireAllPermissions = false,
  requireAuthentication = true,
  allowUnauthenticated = false,
  debug = false
}: RBACGuardProps) {
  const rbac = useRBAC();
  
  // Debug logging
  if (debug) {
    console.log('🛡️ RBACGuard Debug:', {
      user: rbac.user,
      role: rbac.role,
      checks: { role, roles, minimumRole, permission, permissions },
      results: {
        isAuthenticated: rbac.isAuthenticated,
        hasRole: role ? rbac.role === role : undefined,
        hasAnyRole: roles ? roles.includes(rbac.role!) : undefined,
        hasMinRole: minimumRole ? rbac.hasMinRole(minimumRole) : undefined,
        hasPermission: permission ? rbac.can(permission) : undefined,
        hasPermissions: permissions ? (requireAllPermissions ? rbac.canAll(permissions) : rbac.canAny(permissions)) : undefined,
      }
    });
  }
  
  // Check authentication first
  if (requireAuthentication && !rbac.isAuthenticated) {
    if (allowUnauthenticated) {
      return <>{children}</>;
    }
    return showFallback ? <>{fallback}</> : null;
  }
  
  // If no restrictions specified, allow access
  if (!role && !roles && !minimumRole && !permission && !permissions) {
    return <>{children}</>;
  }
  
  let hasAccess = true;
  
  // Check specific role
  if (role && rbac.role !== role) {
    hasAccess = false;
  }
  
  // Check if user has any of the specified roles
  if (roles && !roles.includes(rbac.role!)) {
    hasAccess = false;
  }
  
  // Check minimum role level
  if (minimumRole && !rbac.hasMinRole(minimumRole)) {
    hasAccess = false;
  }
  
  // Check specific permission
  if (permission && !rbac.can(permission)) {
    hasAccess = false;
  }
  
  // Check multiple permissions
  if (permissions) {
    const permissionCheck = requireAllPermissions 
      ? rbac.canAll(permissions) 
      : rbac.canAny(permissions);
    
    if (!permissionCheck) {
      hasAccess = false;
    }
  }
  
  return hasAccess ? <>{children}</> : (showFallback ? <>{fallback}</> : null);
}

/**
 * Permission Guard - chỉ kiểm tra permissions
 */
export function PermissionGuard({
  children,
  fallback = null,
  showFallback = true,
  permission,
  permissions,
  requireAll = false
}: PermissionGuardProps) {
  const { can, canAll, canAny } = useRBAC();
  
  let hasPermission = true;
  
  if (permission) {
    hasPermission = can(permission);
  } else if (permissions) {
    hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
  }
  
  return hasPermission ? <>{children}</> : (showFallback ? <>{fallback}</> : null);
}

/**
 * Role Guard - chỉ kiểm tra roles
 */
export function RoleGuard({
  children,
  fallback = null,
  showFallback = true,
  role,
  roles,
  minimumRole
}: RoleGuardProps) {
  const rbac = useRBAC();
  
  let hasRole = true;
  
  if (role && rbac.role !== role) {
    hasRole = false;
  }
  
  if (roles && !roles.includes(rbac.role!)) {
    hasRole = false;
  }
  
  if (minimumRole && !rbac.hasMinRole(minimumRole)) {
    hasRole = false;
  }
  
  return hasRole ? <>{children}</> : (showFallback ? <>{fallback}</> : null);
}

/**
 * Admin Guard - chỉ cho admin và super admin
 */
export function AdminGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  return (
    <RoleGuard 
      roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} 
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Owner Guard - chỉ cho owner và cao hơn
 */
export function OwnerGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  return (
    <RoleGuard 
      minimumRole={UserRole.OWNER}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Manager Guard - cho PM và cao hơn
 */
export function ManagerGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  return (
    <RoleGuard 
      minimumRole={UserRole.PM}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Leader Guard - cho leader và cao hơn
 */
export function LeaderGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  return (
    <RoleGuard 
      minimumRole={UserRole.LEADER}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Member Guard - cho member và cao hơn (basic authentication)
 */
export function MemberGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  return (
    <RoleGuard 
      minimumRole={UserRole.MEMBER}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Authenticated Guard - chỉ cho user đã đăng nhập
 */
export function AuthenticatedGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  const { isAuthenticated } = useRBAC();
  
  return isAuthenticated ? <>{children}</> : (showFallback ? <>{fallback}</> : null);
}

/**
 * Guest Guard - chỉ cho user chưa đăng nhập
 */
export function GuestGuard({ children, fallback, showFallback = true }: BaseGuardProps) {
  const { isAuthenticated } = useRBAC();
  
  return !isAuthenticated ? <>{children}</> : (showFallback ? <>{fallback}</> : null);
}

/**
 * Conditional Role Renderer - render khác nhau dựa trên role
 */
interface ConditionalRoleRendererProps {
  superAdmin?: React.ReactNode;
  admin?: React.ReactNode;
  owner?: React.ReactNode;
  projectManager?: React.ReactNode;
  leader?: React.ReactNode;
  member?: React.ReactNode;
  guest?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRoleRenderer({
  superAdmin,
  admin,
  owner,
  projectManager,
  leader,
  member,
  guest,
  fallback
}: ConditionalRoleRendererProps) {
  const rbac = useRBAC();
  
  if (rbac.isSuperAdmin && superAdmin) return <>{superAdmin}</>;
  if (rbac.isAdmin && admin) return <>{admin}</>;
  if (rbac.isOwner && owner) return <>{owner}</>;
  if (rbac.isProjectManager && projectManager) return <>{projectManager}</>;
  if (rbac.isLeader && leader) return <>{leader}</>;
  if (rbac.isMember && member) return <>{member}</>;
  if (rbac.isGuest && guest) return <>{guest}</>;
  
  return fallback ? <>{fallback}</> : null;
}

/**
 * HOC để wrap component với RBAC protection
 */
export function withRBAC<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RBACGuardProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <RBACGuard {...guardProps}>
        <Component {...props} />
      </RBACGuard>
    );
  };
}

// Export all guards as named exports
export {
  RBACGuard as default,
};