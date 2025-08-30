// Auth Constants - Role-Based Access Control (RBAC)
// Compatible with Backend JWT authentication system

export enum UserRole {
  // System Level
  ADMIN = 'ADMIN',               // Quản trị viên hệ thống
  MEMBER = 'MEMBER',             // Thành viên thông thường

  // Team Level
  TEAM_OWNER = 'TEAM_OWNER',     // Chủ sở hữu team
  TEAM_MEMBER = 'TEAM_MEMBER',   // Thành viên team

  // Project Level
  PROJECT_OWNER = 'PROJECT_OWNER', // Chủ sở hữu project
  PROJECT_MEMBER = 'PROJECT_MEMBER', // Thành viên project

  // Legacy roles for compatibility
  SUPER_ADMIN = 'SUPER_ADMIN',   // Super admin
  OWNER = 'OWNER',               // Owner
  PM = 'PM',                     // Project Manager
  LEADER = 'LEADER',             // Team Leader
  GUEST = 'GUEST'                // Guest user
}

export enum Permission {
  // System Management
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',           // Quản lý cấu hình hệ thống
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',         // Xem thống kê, phân tích

  // Workspace Management
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
  MANAGE_WORKSPACE = 'MANAGE_WORKSPACE',
  DELETE_WORKSPACE = 'DELETE_WORKSPACE',

  // User & Role Management
  INVITE_USERS = 'INVITE_USERS',
  MANAGE_USERS = 'MANAGE_USERS',            // CRUD users
  MANAGE_ROLES = 'MANAGE_ROLES',            // Assign/remove roles
  VIEW_MEMBERS = 'VIEW_MEMBERS',

  // Project Management
  CREATE_PROJECT = 'CREATE_PROJECT',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  VIEW_PROJECT = 'VIEW_PROJECT',
  MANAGE_PROJECT_SETTINGS = 'MANAGE_PROJECT_SETTINGS',

  // Team Management
  CREATE_TEAM = 'CREATE_TEAM',
  MANAGE_TEAM = 'MANAGE_TEAM',              // Add/remove members
  DELETE_TEAM = 'DELETE_TEAM',

  // Task Management
  CREATE_TASK = 'CREATE_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  VIEW_TASK = 'VIEW_TASK',
  COMMENT_ON_TASK = 'COMMENT_ON_TASK',

  // Resource Management
  UPLOAD_FILE = 'UPLOAD_FILE',
  DELETE_FILE = 'DELETE_FILE',
  VIEW_FILES = 'VIEW_FILES',

  // Reporting & Analytics
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',

  // Billing & Subscription (for SaaS)
  MANAGE_BILLING = 'MANAGE_BILLING',
  VIEW_BILLING = 'VIEW_BILLING',

  // Notifications
  MANAGE_NOTIFICATIONS = 'MANAGE_NOTIFICATIONS',
  SEND_NOTIFICATIONS = 'SEND_NOTIFICATIONS',

  // Integration Management
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  VIEW_INTEGRATIONS = 'VIEW_INTEGRATIONS',

  // API Access
  API_ACCESS = 'API_ACCESS',
  WEBHOOK_MANAGEMENT = 'WEBHOOK_MANAGEMENT',
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_WORKSPACE,
    Permission.MANAGE_WORKSPACE,
    Permission.DELETE_WORKSPACE,
    Permission.INVITE_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TEAM,
    Permission.MANAGE_TEAM,
    Permission.DELETE_TEAM,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.DELETE_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.SEND_NOTIFICATIONS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.VIEW_INTEGRATIONS,
    Permission.API_ACCESS,
    Permission.WEBHOOK_MANAGEMENT,
  ],

  [UserRole.ADMIN]: [
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_WORKSPACE,
    Permission.INVITE_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TEAM,
    Permission.MANAGE_TEAM,
    Permission.DELETE_TEAM,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.DELETE_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_BILLING,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.SEND_NOTIFICATIONS,
    Permission.VIEW_INTEGRATIONS,
    Permission.API_ACCESS,
  ],

  [UserRole.OWNER]: [
    Permission.MANAGE_WORKSPACE,
    Permission.INVITE_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TEAM,
    Permission.MANAGE_TEAM,
    Permission.DELETE_TEAM,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.DELETE_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING,
    Permission.SEND_NOTIFICATIONS,
    Permission.VIEW_INTEGRATIONS,
  ],

  [UserRole.PM]: [
    Permission.VIEW_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TEAM,
    Permission.MANAGE_TEAM,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
    Permission.SEND_NOTIFICATIONS,
  ],

  [UserRole.LEADER]: [
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_TEAM,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.TEAM_OWNER]: [
    Permission.VIEW_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.CREATE_TEAM,
    Permission.MANAGE_TEAM,
    Permission.DELETE_TEAM,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.TEAM_MEMBER]: [
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PROJECT,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
  ],

  [UserRole.PROJECT_OWNER]: [
    Permission.VIEW_MEMBERS,
    Permission.UPDATE_PROJECT,
    Permission.VIEW_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TASK,
    Permission.ASSIGN_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.PROJECT_MEMBER]: [
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PROJECT,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
  ],

  [UserRole.MEMBER]: [
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PROJECT,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.UPLOAD_FILE,
    Permission.VIEW_FILES,
  ],

  [UserRole.GUEST]: [
    Permission.VIEW_PROJECT,
    Permission.VIEW_TASK,
    Permission.VIEW_FILES,
  ],
};

// Helper functions for role hierarchy
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.GUEST]: 0,
  [UserRole.MEMBER]: 1,
  [UserRole.PROJECT_MEMBER]: 2,
  [UserRole.TEAM_MEMBER]: 2,
  [UserRole.PROJECT_OWNER]: 3,
  [UserRole.LEADER]: 4,
  [UserRole.TEAM_OWNER]: 4,
  [UserRole.PM]: 5,
  [UserRole.OWNER]: 6,
  [UserRole.ADMIN]: 7,
  [UserRole.SUPER_ADMIN]: 8,
};

// Default role for new users
export const DEFAULT_USER_ROLE = UserRole.MEMBER;

// Public roles that don't require authentication
export const PUBLIC_ROLES = [UserRole.GUEST];

// Admin roles
export const ADMIN_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.OWNER,
];

// Management roles
export const MANAGEMENT_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.OWNER,
  UserRole.PM,
  UserRole.LEADER,
  UserRole.TEAM_OWNER,
  UserRole.PROJECT_OWNER,
];

// Helper function to check if a role has higher or equal priority
export function hasRolePriority(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Helper function to get permissions for a role
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

// Helper function to check if user can access a resource
export function canAccessResource(
  userRole: UserRole,
  allowedRoles: UserRole[],
  requiredPermissions?: Permission[]
): boolean {
  // Check role access
  const hasRoleAccess = allowedRoles.some(allowedRole =>
    hasRolePriority(userRole, allowedRole)
  );

  if (!hasRoleAccess) {
    return false;
  }

  // Check permission access if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = getPermissionsForRole(userRole);
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }

  return true;
}
