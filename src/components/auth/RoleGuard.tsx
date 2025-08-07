// Role-based Component Guard
'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole | UserRole[];
  minimumRole?: UserRole;
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
  contextType?: 'project' | 'team' | 'portfolio';
  contextId?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  minimumRole,
  resource,
  action,
  fallback = null,
  contextType,
  contextId,
}) => {
  const { hasRole, hasMinimumRole, hasPermission } = usePermissions({
    contextType,
    contextId,
  });

  // Check role-based access
  if (roles && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  // Check minimum role level
  if (minimumRole && !hasMinimumRole(minimumRole)) {
    return <>{fallback}</>;
  }

  // Check specific permission
  if (resource && action && !hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for common role checks
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard roles="admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const OwnerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard roles="owner" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ManagerAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard minimumRole="project_manager" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const LeaderAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard minimumRole="leader" fallback={fallback}>
    {children}
  </RoleGuard>
);

// Permission-based guards
export const CanCreateProjects: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard resource="projects" action="create" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CanManageUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard resource="users" action="manage" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CanAssignTasks: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard resource="tasks" action="assign" fallback={fallback}>
    {children}
  </RoleGuard>
);