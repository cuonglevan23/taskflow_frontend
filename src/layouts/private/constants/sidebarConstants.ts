/**
 * Sidebar Constants
 * Centralize magic strings and configuration
 */

// Badge color mapping
export const BADGE_COLORS = {
  default: "bg-gray-500 text-white",
  primary: "bg-blue-500 text-white", 
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-white",
  danger: "bg-red-500 text-white",
} as const;

export type BadgeColor = keyof typeof BADGE_COLORS;

// Sidebar dimensions
export const SIDEBAR_DIMENSIONS = {
  COLLAPSED_WIDTH: "w-16",
  EXPANDED_WIDTH: "w-64",
} as const;

// Common CSS classes
export const SIDEBAR_CLASSES = {
  CONTAINER: "fixed top-12 left-0 h-[calc(100vh-3rem)] bg-gray-800 border-r border-gray-700 z-50 transform transition-all duration-300 ease-in-out flex flex-col",
  BACKDROP: "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden",
  SECTION_HEADER: "flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 py-1 hover:text-gray-300 transition-colors",
  NAV_ITEM_BASE: "flex items-center rounded text-sm font-medium transition-colors group",
  NAV_ITEM_ACTIVE: "bg-orange-600 text-white",
  NAV_ITEM_INACTIVE: "text-gray-300 hover:bg-gray-700 hover:text-white",
  CREATE_BUTTON: "flex items-center space-x-3 px-2 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors w-full",
} as const;

// Mock data for development
export const MOCK_TEAMS = [
  { id: 1, name: 'Team A' },
  { id: 2, name: 'Team B' }, 
  { id: 3, name: 'Team C' },
] as const;

// Navigation item types
export const NAV_SECTIONS = {
  MAIN: 'main',
  INSIGHTS: 'insights', 
  PROJECTS: 'projects',
  TEAMS: 'teams',
  MANAGEMENTS: 'managements',
} as const;

// Default expanded sections
export const DEFAULT_EXPANDED_SECTIONS = [NAV_SECTIONS.MAIN];

// Role-based project titles
export const PROJECT_TITLES = {
  MEMBER: 'Projects ',
  LEADER: 'Projects ',
  PM: 'Projects',
  OWNER: 'Projects (toàn org)',
  ADMIN: 'Projects (toàn org)',
  SUPER_ADMIN: 'Projects (toàn org)',
} as const;