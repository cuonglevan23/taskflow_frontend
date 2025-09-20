// Permission Management Hook - Enhanced with Context-Based Permissions
import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  UserRole,
  SystemRole,
  ProjectRole,
  TeamRole,
  Permission,
  hasPermission as checkPermission,
  hasSystemPermission,
  hasProjectPermission,
  hasTeamPermission,
  ROLE_PERMISSIONS
} from '@/constants/auth';

interface PermissionContext {
  projectRole?: ProjectRole;
  teamRole?: TeamRole;
  projectId?: string | number;
  teamId?: string | number;
}

export function usePermissions(context?: PermissionContext): {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasSystemPermission: (permission: Permission) => boolean;
  hasProjectPermission: (permission: Permission) => boolean;
  hasTeamPermission: (permission: Permission) => boolean;
  canAccess: (requiredPermissions: Permission[]) => boolean;
  userRole: UserRole | null;
  systemRole: SystemRole | null;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();

  // Get system role
  const systemRole = useMemo(() => {
    if (!user?.role) return null;
    const role = user.role.toUpperCase();
    return (role === 'ADMIN' ? SystemRole.ADMIN : SystemRole.MEMBER) as SystemRole;
  }, [user?.role]);

  // Get system permissions
  const systemPermissions = useMemo(() => {
    if (!systemRole) return [];
    return ROLE_PERMISSIONS[systemRole === SystemRole.ADMIN ? UserRole.ADMIN : UserRole.MEMBER] || [];
  }, [systemRole]);

  // Get project permissions (if context provided)
  const projectPermissions = useMemo(() => {
    if (!context?.projectRole) return [];
    switch (context.projectRole) {
      case ProjectRole.OWNER:
        return [
          Permission.UPDATE_PROJECT,
          Permission.DELETE_PROJECT,
          Permission.VIEW_PROJECT,
          Permission.MANAGE_PROJECT_SETTINGS,
          Permission.CREATE_TEAM,
          Permission.CREATE_TASK,
          Permission.UPDATE_TASK,
          Permission.DELETE_TASK,
          Permission.VIEW_TASK,
          Permission.ASSIGN_TASK,
          Permission.COMMENT_ON_TASK,
          Permission.UPLOAD_FILE,
          Permission.DELETE_FILE,
          Permission.VIEW_FILES,
          Permission.VIEW_MEMBERS,
          Permission.INVITE_USERS
        ];
      case ProjectRole.MEMBER:
        return [
          Permission.UPDATE_PROJECT,
          Permission.VIEW_PROJECT,
          Permission.CREATE_TEAM,
          Permission.CREATE_TASK,
          Permission.UPDATE_TASK,
          Permission.DELETE_TASK,
          Permission.VIEW_TASK,
          Permission.ASSIGN_TASK,
          Permission.COMMENT_ON_TASK,
          Permission.UPLOAD_FILE,
          Permission.DELETE_FILE,
          Permission.VIEW_FILES,
          Permission.VIEW_MEMBERS,
          Permission.INVITE_USERS
        ];
      default:
        return [];
    }
  }, [context?.projectRole]);

  // Get team permissions (if context provided)
  const teamPermissions = useMemo(() => {
    if (!context?.teamRole) return [];
    switch (context.teamRole) {
      case TeamRole.OWNER:
        return [
          Permission.UPDATE_TEAM,
          Permission.DELETE_TEAM,
          Permission.VIEW_TEAM,
          Permission.MANAGE_TEAM_MEMBERS,
          Permission.CREATE_TASK,
          Permission.UPDATE_TASK,
          Permission.DELETE_TASK,
          Permission.VIEW_TASK,
          Permission.ASSIGN_TASK,
          Permission.COMMENT_ON_TASK,
          Permission.UPLOAD_FILE,
          Permission.DELETE_FILE,
          Permission.VIEW_FILES,
          Permission.INVITE_USERS
        ];
      case TeamRole.LEADER:
        return [
          Permission.UPDATE_TEAM,
          Permission.VIEW_TEAM,
          Permission.MANAGE_TEAM_MEMBERS,
          Permission.CREATE_TASK,
          Permission.UPDATE_TASK,
          Permission.DELETE_TASK,
          Permission.VIEW_TASK,
          Permission.ASSIGN_TASK,
          Permission.COMMENT_ON_TASK,
          Permission.UPLOAD_FILE,
          Permission.VIEW_FILES,
          Permission.INVITE_USERS
        ];
      case TeamRole.MEMBER:
        return [
          Permission.VIEW_TEAM,
          Permission.CREATE_TASK,
          Permission.UPDATE_TASK,
          Permission.VIEW_TASK,
          Permission.COMMENT_ON_TASK,
          Permission.UPLOAD_FILE,
          Permission.VIEW_FILES
        ];
      default:
        return [];
    }
  }, [context?.teamRole]);

  // Combine all permissions
  const allPermissions = useMemo(() => {
    return [...new Set([...systemPermissions, ...projectPermissions, ...teamPermissions])];
  }, [systemPermissions, projectPermissions, teamPermissions]);

  // Check if user has permission in any context
  const hasPermissionInContext = useMemo(() =>
    (permission: Permission) => {
      // Check system permission first
      if (systemPermissions.includes(permission)) return true;

      // Check project permission
      if (projectPermissions.includes(permission)) return true;

      // Check team permission
      if (teamPermissions.includes(permission)) return true;

      return false;
    },
    [systemPermissions, projectPermissions, teamPermissions]
  );

  // Individual permission checkers
  const hasSystemPermissionCheck = useMemo(() =>
    (permission: Permission) => systemPermissions.includes(permission),
    [systemPermissions]
  );

  const hasProjectPermissionCheck = useMemo(() =>
    (permission: Permission) => projectPermissions.includes(permission),
    [projectPermissions]
  );

  const hasTeamPermissionCheck = useMemo(() =>
    (permission: Permission) => teamPermissions.includes(permission),
    [teamPermissions]
  );

  const canAccess = useMemo(() =>
    (requiredPermissions: Permission[]) =>
      requiredPermissions.every(permission => hasPermissionInContext(permission)),
    [hasPermissionInContext]
  );

  return {
    permissions: allPermissions,
    hasPermission: hasPermissionInContext,
    hasSystemPermission: hasSystemPermissionCheck,
    hasProjectPermission: hasProjectPermissionCheck,
    hasTeamPermission: hasTeamPermissionCheck,
    canAccess,
    userRole: user?.role as UserRole || null,
    systemRole,
    isLoading,
  };
}
