// Dashboard module - Complete export
// Centralized exports for dashboard services, hooks, types and utilities

// Core service
export { dashboardService, DashboardService } from './dashboardService';

// React hooks
export {
  useDashboard,
  useTaskStats,
  useUpcomingTasks
} from './hooks';

// TypeScript types and interfaces
export type {
  TaskStats,
  TaskBreakdownItem,
  TaskBreakdown,
  TaskItem,
  UpcomingTasks,
  MonthlyTrend,
  CompletionTrends,
  CacheInfo,
  DashboardOverviewResponse,
  DashboardHookResult
} from './types';

// Utility functions
export {
  calculateCompletionRate,
  formatCompletionRate,
  getTaskPriorityColor,
  getTaskStatusColor,
  formatDaysOverdue,
  sortTasksByPriority,
  sortTasksByDeadline,
  getMostUrgentTasks,
  getTrendDirection,
  getTrendIcon,
  calculateProductivityScore,
  getProductivityLevel,
  transformForChart,
  formatCacheExpiry
} from './utils';

// Dashboard API endpoints (for reference)
export const DASHBOARD_ENDPOINTS = {
  OVERVIEW: '/tasks/dashboard/overview',
  CACHE: '/tasks/dashboard/cache',
  STATS: '/tasks/dashboard/stats',
  UPCOMING: '/tasks/dashboard/upcoming'
} as const;

// Default configuration
export const DASHBOARD_CONFIG = {
  CACHE_TTL: 300, // 5 minutes in seconds
  REFRESH_INTERVAL: 30000, // 30 seconds in milliseconds
  AUTO_REFRESH: false,
  MAX_URGENT_TASKS: 5,
  MAX_DUE_TODAY_TASKS: 5,
  MAX_OVERDUE_TASKS: 5
} as const;
