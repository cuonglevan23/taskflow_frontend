// Auth related enums
export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum Permission {
  // Project permissions
  CREATE_PROJECT = 'create_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  VIEW_PROJECT = 'view_project',
  
  // Task permissions
  CREATE_TASK = 'create_task',
  EDIT_TASK = 'edit_task',
  DELETE_TASK = 'delete_task',
  VIEW_TASK = 'view_task',
  ASSIGN_TASK = 'assign_task',
  
  // User management
  MANAGE_USERS = 'manage_users',
  INVITE_USERS = 'invite_users',
  
  // System permissions
  ADMIN_ACCESS = 'admin_access'
}

// Base user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth context interface
export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Login/Register forms
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}

// Auth response types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthError {
  message: string;
  code: string;
  field?: string;
} 