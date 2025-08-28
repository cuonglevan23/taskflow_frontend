/**
 * Sidebar Constants// Common CSS classes with theme-based hover styles
export const SIDEBAR_CLASSES = {
  CONTAINER: "fixed top-12 left-0 h-[calc(100vh-3rem)] z-40 transform transition-all duration-300 ease-in-out flex flex-col",
  BACKDROP: "fixed inset-0 bg-black bg-opacity-50 z-30",Centralize magic strings and configuration
 */

import { DARK_THEME } from "@/constants/theme";

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

// Common CSS classes with theme-based hover styles
export const SIDEBAR_CLASSES = {
  CONTAINER: "fixed top-12 left-0 h-[calc(100vh-3rem)] z-[60] transform transition-all duration-300 ease-in-out flex flex-col",
  BACKDROP: "fixed inset-0 bg-opacity-50 z-[55]",
  SECTION_HEADER: `flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider mb-2 px-2 py-1 transition-colors`,
  NAV_ITEM_BASE: "flex items-center rounded text-sm font-medium transition-colors group",
  NAV_ITEM_ACTIVE: "bg-orange-600 text-white",
  NAV_ITEM_INACTIVE: `transition-colors`,
  CREATE_BUTTON: `flex items-center space-x-3 px-2 py-1.5 rounded text-sm font-medium transition-colors w-full`,
} as const;

// Dynamic styles using theme variables
export const getSidebarStyles = () => ({
  sectionHeader: {
    color: DARK_THEME.sidebar.textMuted,
  },
  sectionHeaderHover: {
    color: DARK_THEME.sidebar.text,
  },
  navItemInactive: {
    color: DARK_THEME.sidebar.text,
  },
  navItemInactiveHover: {
    backgroundColor: DARK_THEME.sidebar.hover,
    color: DARK_THEME.sidebar.text,
  },
  createButton: {
    color: DARK_THEME.sidebar.textMuted,
  },
  createButtonHover: {
    color: DARK_THEME.sidebar.text,
    backgroundColor: DARK_THEME.sidebar.hover,
  },
});

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
  MANAGEMENT: 'management',
} as const;

// Default expanded sections
export const DEFAULT_EXPANDED_SECTIONS = [NAV_SECTIONS.MAIN];

// Role-based projects titles
export const PROJECT_TITLES = {
  MEMBER: 'Projects ',
  LEADER: 'Projects ',
  PM: 'Projects',
  OWNER: 'Projects (toàn org)',
  ADMIN: 'Projects (toàn org)',
  SUPER_ADMIN: 'Projects (toàn org)',
} as const;