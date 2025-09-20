// Auth Constants - Role-Based Access Control (RBAC)
// Compatible with Backend JWT authentication system

// System-level roles (toàn hệ thống)
export enum SystemRole {
  ADMIN = 'ADMIN',    // Quản trị viên hệ thống
  MEMBER = 'MEMBER'   // Người dùng thông thường
}

// Project-level roles (trong từng project)
export enum ProjectRole {
  OWNER = 'OWNER',    // Người tạo project (có quyền cao nhất)
  MEMBER = 'MEMBER'   // Thành viên project
}

// Team-level roles (trong từng team)
export enum TeamRole {
  OWNER = 'OWNER',    // Người tạo team
  MEMBER = 'MEMBER',  // Thành viên team
  LEADER = 'LEADER'   // Người lãnh đạo team
}

// Backward compatibility - legacy UserRole enum
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum Permission {
  // System Management (chỉ ADMIN)
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_USERS = 'MANAGE_USERS',

  // Project Management
  CREATE_PROJECT = 'CREATE_PROJECT',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  VIEW_PROJECT = 'VIEW_PROJECT',
  MANAGE_PROJECT_SETTINGS = 'MANAGE_PROJECT_SETTINGS',

  // Team Management
  CREATE_TEAM = 'CREATE_TEAM',
  UPDATE_TEAM = 'UPDATE_TEAM',
  DELETE_TEAM = 'DELETE_TEAM',
  VIEW_TEAM = 'VIEW_TEAM',
  MANAGE_TEAM_MEMBERS = 'MANAGE_TEAM_MEMBERS',

  // Task Management
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  VIEW_TASK = 'VIEW_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
  COMMENT_ON_TASK = 'COMMENT_ON_TASK',

  // File Management
  UPLOAD_FILE = 'UPLOAD_FILE',
  DELETE_FILE = 'DELETE_FILE',
  VIEW_FILES = 'VIEW_FILES',

  // Basic permissions
  VIEW_MEMBERS = 'VIEW_MEMBERS',
  INVITE_USERS = 'INVITE_USERS'
}

// System Role Permissions
export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SystemRole.ADMIN]: [
    // Admin có tất cả quyền
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TEAM,
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
    Permission.VIEW_MEMBERS,
    Permission.INVITE_USERS
  ],

  [SystemRole.MEMBER]: [
    // Member chỉ có quyền cơ bản
    Permission.VIEW_PROJECT,
    Permission.VIEW_TEAM,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_MEMBERS
  ]
}

// Project Role Permissions
export const PROJECT_ROLE_PERMISSIONS: Record<ProjectRole, Permission[]> = {
  [ProjectRole.OWNER]: [
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
  ],

  [ProjectRole.MEMBER]: [
    Permission.VIEW_PROJECT,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_MEMBERS
  ]
}

// Team Role Permissions
export const TEAM_ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  [TeamRole.OWNER]: [
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
  ],

  [TeamRole.LEADER]: [
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
  ],

  [TeamRole.MEMBER]: [
    Permission.VIEW_TEAM,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES
  ]
}

// Legacy compatibility - Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: SYSTEM_ROLE_PERMISSIONS[SystemRole.ADMIN],
  [UserRole.MEMBER]: SYSTEM_ROLE_PERMISSIONS[SystemRole.MEMBER]
}

// Default roles
export const DEFAULT_SYSTEM_ROLE = SystemRole.MEMBER;
export const DEFAULT_PROJECT_ROLE = ProjectRole.MEMBER;
export const DEFAULT_TEAM_ROLE = TeamRole.MEMBER;

// Legacy compatibility
export const DEFAULT_USER_ROLE = UserRole.MEMBER;

// Helper functions
export function getSystemPermissions(role: SystemRole): Permission[] {
  return SYSTEM_ROLE_PERMISSIONS[role] || [];
}

export function getProjectPermissions(role: ProjectRole): Permission[] {
  return PROJECT_ROLE_PERMISSIONS[role] || [];
}

export function getTeamPermissions(role: TeamRole): Permission[] {
  return TEAM_ROLE_PERMISSIONS[role] || [];
}

export function hasSystemPermission(role: SystemRole, permission: Permission): boolean {
  return getSystemPermissions(role).includes(permission);
}

export function hasProjectPermission(role: ProjectRole, permission: Permission): boolean {
  return getProjectPermissions(role).includes(permission);
}

export function hasTeamPermission(role: TeamRole, permission: Permission): boolean {
  return getTeamPermissions(role).includes(permission);
}

// Check if user has permission in any context
export function hasPermission(
  systemRole: SystemRole,
  permission: Permission,
  projectRole?: ProjectRole,
  teamRole?: TeamRole
): boolean {
  // Check system-level permission first
  if (hasSystemPermission(systemRole, permission)) {
    return true;
  }

  // Check project-level permission
  if (projectRole && hasProjectPermission(projectRole, permission)) {
    return true;
  }

  // Check team-level permission
  if (teamRole && hasTeamPermission(teamRole, permission)) {
    return true;
  }

  return false;
}

// Legacy compatibility function
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
