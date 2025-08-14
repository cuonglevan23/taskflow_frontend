/**
 * Sidebar Helper Functions
 * Extract reusable logic and utilities
 */

import { UserRole } from "@/constants/auth";
import type { NavigationItem } from "@/config/rbac-navigation";
import { PROJECT_TITLES, MOCK_TEAMS } from "../constants/sidebarConstants";
import { UserWithRole } from "@/types/roles";

// Type for role checks
type RoleCheckFunction = () => boolean;

interface RoleChecks {
  isMember: RoleCheckFunction;
  isLeader: RoleCheckFunction; 
  isProjectManager: RoleCheckFunction;
  isOwner: RoleCheckFunction;
  isAdmin: RoleCheckFunction;
  isSuperAdmin: RoleCheckFunction;
}

/**
 * Check if navigation item is active
 */
export function isItemActive(item: NavigationItem, pathname: string): boolean {
  if (item.href === pathname) return true;
  
  // Check for dynamic projects routes
  if (item.href.includes('/projects/') && pathname.includes('/projects/')) {
    const projectId = item.href.split('/projects/')[1];
    return pathname.includes(`/projects/${projectId}`);
  }
  
  return false;
}

/**
 * Get projects title based on user role
 */
export function getProjectTitleByRole(roleChecks: RoleChecks): string {
  if (roleChecks.isMember()) return PROJECT_TITLES.MEMBER;
  if (roleChecks.isLeader()) return PROJECT_TITLES.LEADER; 
  if (roleChecks.isProjectManager()) return PROJECT_TITLES.PM;
  if (roleChecks.isOwner()) return PROJECT_TITLES.OWNER;
  if (roleChecks.isAdmin()) return PROJECT_TITLES.ADMIN;
  return PROJECT_TITLES.SUPER_ADMIN;
}

/**
 * Filter projects based on user role
 */
export function filterProjectsByRole(
  projects: any[], 
  roleChecks: RoleChecks
): any[] {
  if (roleChecks.isMember() || roleChecks.isLeader()) {
    // Member & Leader: Show active projects they participate in
    return projects.filter(project => project.status === 'active');
  } 
  
  if (roleChecks.isProjectManager()) {
    // PM: Show active and completed projects they can manage
    return projects.filter(project => 
      project.status === 'active' || project.status === 'completed'
    );
  }
  
  // Owner and above: All projects (no filter needed)
  return projects;
}

/**
 * Check if user should see projects section
 */
export function shouldShowProjectsSection(roleChecks: RoleChecks): boolean {
  return roleChecks.isMember() || roleChecks.isLeader();
}

/**
 * Check if user should see teams section
 */
export function shouldShowTeamsSection(roleChecks: RoleChecks): boolean {
  return roleChecks.isMember() || roleChecks.isLeader();
}

/**
 * Get user's teams (mock data for now)
 */
export function getUserTeams(): typeof MOCK_TEAMS {
  // In real app, this would fetch from API based on user ID
  return MOCK_TEAMS;
}

/**
 * Create navigation items from projects
 */
export function createProjectNavItems(projects: any[]): NavigationItem[] {
  return projects.slice(0, 5).map(project => ({
    id: `project-${project.id}`,
    label: project.name,
    href: `/projects/${project.id}`,
    // Note: icon will be handled in component due to React element
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
  }));
}

/**
 * Create navigation items from teams
 */
export function createTeamNavItems(): NavigationItem[] {
  return getUserTeams().map(team => ({
    id: `team-${team.id}`,
    label: team.name,
    href: `/teams/${team.id}`,
    // Note: icon will be handled in component due to React element
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
  }));
}

/**
 * Get sidebar width class based on collapsed state
 */
export function getSidebarWidth(isCollapsed: boolean): string {
  return isCollapsed ? "w-16" : "w-64";
}

/**
 * Check if labels should be shown
 */
export function shouldShowLabels(isCollapsed: boolean): boolean {
  return !isCollapsed;
}

/**
 * Create role checks object from RBAC hook
 */
export function createRoleChecks(rbac: any): RoleChecks {
  return {
    isMember: () => rbac.isMember,
    isLeader: () => rbac.isLeader,
    isProjectManager: () => rbac.isProjectManager, 
    isOwner: () => rbac.isOwner,
    isAdmin: () => rbac.isAdmin,
    isSuperAdmin: () => rbac.isSuperAdmin,
  };
}