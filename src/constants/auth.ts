export enum UserRole {
  // System Level
  ADMIN = 'ADMIN',               // Quản trị viên hệ thống
  MEMBER = 'MEMBER',             // Thành viên thông thường

  // Team Level
  TEAM_OWNER = 'TEAM_OWNER',     // Chủ sở hữu team
  TEAM_MEMBER = 'TEAM_MEMBER',   // Thành viên team

  // Project Level  
  PROJECT_OWNER = 'PROJECT_OWNER', // Chủ sở hữu project
  PROJECT_MEMBER = 'PROJECT_MEMBER' // Thành viên project
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
  MANAGE_RESOURCES = 'MANAGE_RESOURCES',     // Files, documents
  VIEW_RESOURCES = 'VIEW_RESOURCES',

  // Reporting
  GENERATE_REPORTS = 'GENERATE_REPORTS',
  VIEW_REPORTS = 'VIEW_REPORTS',

  // Billing & Subscription
  MANAGE_BILLING = 'MANAGE_BILLING',
  VIEW_BILLING = 'VIEW_BILLING',
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // Super Admin has all permissions

  [UserRole.ADMIN]: [
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_MEMBERS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_REPORTS,
    ...Object.values(Permission).filter(p => 
      !['MANAGE_BILLING', 'DELETE_WORKSPACE'].includes(p)
    ),
  ],

  [UserRole.OWNER]: [
    Permission.MANAGE_WORKSPACE,
    Permission.DELETE_WORKSPACE,
    Permission.INVITE_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.CREATE_TEAM,
    Permission.MANAGE_TEAM,
    Permission.DELETE_TEAM,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_RESOURCES,
    Permission.VIEW_RESOURCES,
  ],


  [UserRole.MEMBER]: [
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PROJECT,
    Permission.CREATE_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_TASK,
    Permission.COMMENT_ON_TASK,
    Permission.VIEW_REPORTS,
    Permission.VIEW_RESOURCES,
  ],


};
