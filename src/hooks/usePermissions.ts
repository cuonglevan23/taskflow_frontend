// Permission Management Hook
import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  UserRole, 
  ROLE_CONFIGS, 
  ACTIONS, 
  RESOURCES, 
  UserWithRole,
  ContextPermission 
} from '@/types/roles';

interface UsePermissionsProps {
  contextType?: 'project' | 'team' | 'portfolio';
  contextId?: string;
}

export const usePermissions = ({ contextType, contextId }: UsePermissionsProps = {}) => {
  const { user } = useAuth();

  // Get effective role (global or context-specific)
  const effectiveRole = useMemo((): UserRole => {
    if (!user) return 'member';
    
    // If context is specified, check for context-specific role
    if (contextType && contextId && user.projectRoles) {
      const contextRole = user.projectRoles[contextId];
      if (contextRole) return contextRole;
    }
    
    // Fall back to global role
    return user.role || 'member';
  }, [user, contextType, contextId]);

  // Get role configuration
  const roleConfig = useMemo(() => {
    return ROLE_CONFIGS[effectiveRole];
  }, [effectiveRole]);

  // Check if user has permission for specific action on resource
  const hasPermission = useMemo(() => {
    return (resource: string, action: string): boolean => {
      if (!user || !roleConfig) return false;

      const resourcePermission = roleConfig.permissions.find(
        p => p.resource === resource
      );

      if (!resourcePermission) return false;

      return resourcePermission.actions.includes(action) || 
             resourcePermission.actions.includes(ACTIONS.MANAGE);
    };
  }, [user, roleConfig]);

  // Check if user has any of the specified roles
  const hasRole = useMemo(() => {
    return (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      return rolesToCheck.includes(effectiveRole);
    };
  }, [effectiveRole]);

  // Check if user has minimum role level
  const hasMinimumRole = useMemo(() => {
    return (minimumRole: UserRole): boolean => {
      if (!user || !roleConfig) return false;
      
      const minimumLevel = ROLE_CONFIGS[minimumRole].level;
      return roleConfig.level >= minimumLevel;
    };
  }, [user, roleConfig]);

  // Get all permissions for current role
  const permissions = useMemo(() => {
    return roleConfig?.permissions || [];
  }, [roleConfig]);

  // Role-specific permission checkers
  const can = useMemo(() => ({
    // User management
    manageUsers: hasPermission(RESOURCES.USERS, ACTIONS.MANAGE),
    createUsers: hasPermission(RESOURCES.USERS, ACTIONS.CREATE),
    updateUsers: hasPermission(RESOURCES.USERS, ACTIONS.UPDATE),
    deleteUsers: hasPermission(RESOURCES.USERS, ACTIONS.DELETE),
    inviteUsers: hasPermission(RESOURCES.USERS, ACTIONS.INVITE),

    // Project management
    manageProjects: hasPermission(RESOURCES.PROJECTS, ACTIONS.MANAGE),
    createProjects: hasPermission(RESOURCES.PROJECTS, ACTIONS.CREATE),
    updateProjects: hasPermission(RESOURCES.PROJECTS, ACTIONS.UPDATE),
    deleteProjects: hasPermission(RESOURCES.PROJECTS, ACTIONS.DELETE),

    // Task management
    manageTasks: hasPermission(RESOURCES.TASKS, ACTIONS.MANAGE),
    createTasks: hasPermission(RESOURCES.TASKS, ACTIONS.CREATE),
    updateTasks: hasPermission(RESOURCES.TASKS, ACTIONS.UPDATE),
    deleteTasks: hasPermission(RESOURCES.TASKS, ACTIONS.DELETE),
    assignTasks: hasPermission(RESOURCES.TASKS, ACTIONS.ASSIGN),

    // Team management
    manageTeams: hasPermission(RESOURCES.TEAMS, ACTIONS.MANAGE),
    createTeams: hasPermission(RESOURCES.TEAMS, ACTIONS.CREATE),
    updateTeams: hasPermission(RESOURCES.TEAMS, ACTIONS.UPDATE),
    deleteTeams: hasPermission(RESOURCES.TEAMS, ACTIONS.DELETE),

    // Reports
    viewReports: hasPermission(RESOURCES.REPORTS, ACTIONS.READ),
    exportReports: hasPermission(RESOURCES.REPORTS, ACTIONS.EXPORT),

    // Settings
    manageSettings: hasPermission(RESOURCES.SETTINGS, ACTIONS.MANAGE),
    updateSettings: hasPermission(RESOURCES.SETTINGS, ACTIONS.UPDATE),

    // Billing
    manageBilling: hasPermission(RESOURCES.BILLING, ACTIONS.MANAGE),
    viewBilling: hasPermission(RESOURCES.BILLING, ACTIONS.READ),

    // Portfolios
    managePortfolios: hasPermission(RESOURCES.PORTFOLIOS, ACTIONS.MANAGE),
    createPortfolios: hasPermission(RESOURCES.PORTFOLIOS, ACTIONS.CREATE),
    updatePortfolios: hasPermission(RESOURCES.PORTFOLIOS, ACTIONS.UPDATE),
    deletePortfolios: hasPermission(RESOURCES.PORTFOLIOS, ACTIONS.DELETE),

    // Goals
    manageGoals: hasPermission(RESOURCES.GOALS, ACTIONS.MANAGE),
    createGoals: hasPermission(RESOURCES.GOALS, ACTIONS.CREATE),
    updateGoals: hasPermission(RESOURCES.GOALS, ACTIONS.UPDATE),
    deleteGoals: hasPermission(RESOURCES.GOALS, ACTIONS.DELETE),
  }), [hasPermission]);

  // Role level checks
  const is = useMemo(() => ({
    admin: hasRole('admin'),
    owner: hasRole('owner'),
    projectManager: hasRole('project_manager'),
    leader: hasRole('leader'),
    member: hasRole('member'),
    
    // Minimum role checks
    atLeastOwner: hasMinimumRole('owner'),
    atLeastProjectManager: hasMinimumRole('project_manager'),
    atLeastLeader: hasMinimumRole('leader'),
  }), [hasRole, hasMinimumRole]);

  return {
    user: user as UserWithRole,
    role: effectiveRole,
    roleConfig,
    permissions,
    hasPermission,
    hasRole,
    hasMinimumRole,
    can,
    is,
  };
};