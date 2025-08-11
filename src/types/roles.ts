// Role-based Access Control Types
export type UserRole = 'admin' | 'owner' | 'project_manager' | 'leader' | 'member';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RoleConfig {
  name: UserRole;
  level: number; // Higher number = more permissions
  permissions: Permission[];
  inheritsFrom?: UserRole[];
}

// Permission actions
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage', // Full control
  ASSIGN: 'assign',
  APPROVE: 'approve',
  EXPORT: 'export',
  INVITE: 'invite',
} as const;

// Resources
export const RESOURCES = {
  USERS: 'users',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  TEAMS: 'teams',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  BILLING: 'billing',
  PORTFOLIOS: 'portfolios',
  GOALS: 'goals',
} as const;

// Role hierarchy and permissions
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'admin',
    level: 100,
    permissions: [
      {
        resource: RESOURCES.USERS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.INVITE]
      },
      {
        resource: RESOURCES.PROJECTS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      },
      {
        resource: RESOURCES.TASKS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.ASSIGN]
      },
      {
        resource: RESOURCES.TEAMS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      },
      {
        resource: RESOURCES.REPORTS,
        actions: [ACTIONS.READ, ACTIONS.EXPORT]
      },
      {
        resource: RESOURCES.SETTINGS,
        actions: [ACTIONS.MANAGE, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.BILLING,
        actions: [ACTIONS.MANAGE, ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.PORTFOLIOS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      },
      {
        resource: RESOURCES.GOALS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      }
    ]
  },
  
  owner: {
    name: 'owner',
    level: 90,
    permissions: [
      {
        resource: RESOURCES.USERS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.INVITE]
      },
      {
        resource: RESOURCES.PROJECTS,
        actions: [ACTIONS.MANAGE, ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      },
      {
        resource: RESOURCES.TASKS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.ASSIGN]
      },
      {
        resource: RESOURCES.TEAMS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      },
      {
        resource: RESOURCES.REPORTS,
        actions: [ACTIONS.READ, ACTIONS.EXPORT]
      },
      {
        resource: RESOURCES.SETTINGS,
        actions: [ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.BILLING,
        actions: [ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.PORTFOLIOS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      },
      {
        resource: RESOURCES.GOALS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
      }
    ]
  },

  project_manager: {
    name: 'project_manager',
    level: 70,
    permissions: [
      {
        resource: RESOURCES.USERS,
        actions: [ACTIONS.READ, ACTIONS.INVITE]
      },
      {
        resource: RESOURCES.PROJECTS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.TASKS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.ASSIGN]
      },
      {
        resource: RESOURCES.TEAMS,
        actions: [ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.REPORTS,
        actions: [ACTIONS.READ, ACTIONS.EXPORT]
      },
      {
        resource: RESOURCES.PORTFOLIOS,
        actions: [ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.GOALS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE]
      }
    ]
  },

  leader: {
    name: 'leader',
    level: 50,
    permissions: [
      {
        resource: RESOURCES.USERS,
        actions: [ACTIONS.READ]
      },
      {
        resource: RESOURCES.PROJECTS,
        actions: [ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.TASKS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.ASSIGN]
      },
      {
        resource: RESOURCES.TEAMS,
        actions: [ACTIONS.READ]
      },
      {
        resource: RESOURCES.REPORTS,
        actions: [ACTIONS.READ]
      },
      {
        resource: RESOURCES.GOALS,
        actions: [ACTIONS.READ, ACTIONS.UPDATE]
      }
    ]
  },

  member: {
    name: 'member',
    level: 10,
    permissions: [
      {
        resource: RESOURCES.USERS,
        actions: [ACTIONS.READ]
      },
      {
        resource: RESOURCES.PROJECTS,
        actions: [ACTIONS.READ]
      },
      {
        resource: RESOURCES.TASKS,
        actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE]
      },
      {
        resource: RESOURCES.TEAMS,
        actions: [ACTIONS.READ]
      },
      {
        resource: RESOURCES.REPORTS,
        actions: [ACTIONS.READ]
      }
    ]
  }
};

// Base User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: Permission[];
  avatar?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// User with role context
export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: Permission[];
  projectRoles?: Record<string, UserRole>; // Different roles per project
  avatar?: string; // Avatar URL from OAuth or backend
  isFirstLogin?: boolean; // OAuth first login flag
}

// Context-specific permissions (e.g., project-level roles)
export interface ContextPermission {
  userId: string;
  contextType: 'project' | 'team' | 'portfolio';
  contextId: string;
  role: UserRole;
}