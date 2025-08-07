// Role Utility Functions
import { UserRole, ROLE_CONFIGS, UserWithRole } from '@/types/roles';

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    owner: 'Owner',
    project_manager: 'Project Manager',
    leader: 'Team Leader',
    member: 'Member',
  };
  
  return roleNames[role] || 'Unknown';
};

/**
 * Get role color for UI display
 */
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    admin: '#dc2626', // red-600
    owner: '#7c3aed', // violet-600
    project_manager: '#2563eb', // blue-600
    leader: '#059669', // emerald-600
    member: '#6b7280', // gray-500
  };
  
  return roleColors[role] || '#6b7280';
};

/**
 * Get role badge variant
 */
export const getRoleBadgeVariant = (role: UserRole): 'destructive' | 'secondary' | 'default' | 'outline' => {
  const variants: Record<UserRole, 'destructive' | 'secondary' | 'default' | 'outline'> = {
    admin: 'destructive',
    owner: 'secondary',
    project_manager: 'default',
    leader: 'outline',
    member: 'outline',
  };
  
  return variants[role] || 'outline';
};

/**
 * Check if role A has higher level than role B
 */
export const isHigherRole = (roleA: UserRole, roleB: UserRole): boolean => {
  return ROLE_CONFIGS[roleA].level > ROLE_CONFIGS[roleB].level;
};

/**
 * Get all roles that are lower than the given role
 */
export const getLowerRoles = (role: UserRole): UserRole[] => {
  const currentLevel = ROLE_CONFIGS[role].level;
  
  return Object.values(ROLE_CONFIGS)
    .filter(config => config.level < currentLevel)
    .map(config => config.name)
    .sort((a, b) => ROLE_CONFIGS[b].level - ROLE_CONFIGS[a].level);
};

/**
 * Get all roles that are higher than the given role
 */
export const getHigherRoles = (role: UserRole): UserRole[] => {
  const currentLevel = ROLE_CONFIGS[role].level;
  
  return Object.values(ROLE_CONFIGS)
    .filter(config => config.level > currentLevel)
    .map(config => config.name)
    .sort((a, b) => ROLE_CONFIGS[b].level - ROLE_CONFIGS[a].level);
};

/**
 * Get roles that can be assigned by the current role
 */
export const getAssignableRoles = (currentRole: UserRole): UserRole[] => {
  // Users can only assign roles lower than their own
  return getLowerRoles(currentRole);
};

/**
 * Check if user can assign a specific role
 */
export const canAssignRole = (currentRole: UserRole, targetRole: UserRole): boolean => {
  return isHigherRole(currentRole, targetRole);
};

/**
 * Get role hierarchy for display
 */
export const getRoleHierarchy = (): { role: UserRole; level: number; name: string }[] => {
  return Object.values(ROLE_CONFIGS)
    .map(config => ({
      role: config.name,
      level: config.level,
      name: getRoleDisplayName(config.name),
    }))
    .sort((a, b) => b.level - a.level);
};

/**
 * Filter users by minimum role level
 */
export const filterUsersByMinimumRole = (
  users: UserWithRole[], 
  minimumRole: UserRole
): UserWithRole[] => {
  const minimumLevel = ROLE_CONFIGS[minimumRole].level;
  
  return users.filter(user => 
    ROLE_CONFIGS[user.role].level >= minimumLevel
  );
};

/**
 * Sort users by role hierarchy
 */
export const sortUsersByRole = (users: UserWithRole[]): UserWithRole[] => {
  return [...users].sort((a, b) => 
    ROLE_CONFIGS[b.role].level - ROLE_CONFIGS[a.role].level
  );
};

/**
 * Get role description for tooltips/help text
 */
export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full system access with all administrative privileges',
    owner: 'Organization owner with billing and high-level management access',
    project_manager: 'Can manage projects, tasks, and team members within assigned projects',
    leader: 'Can lead teams and manage tasks within their scope',
    member: 'Basic access to view and work on assigned tasks',
  };
  
  return descriptions[role] || 'No description available';
};

/**
 * Get role icon for UI display
 */
export const getRoleIcon = (role: UserRole): string => {
  const icons: Record<UserRole, string> = {
    admin: '👑',
    owner: '🏢',
    project_manager: '📊',
    leader: '👥',
    member: '👤',
  };
  
  return icons[role] || '👤';
};