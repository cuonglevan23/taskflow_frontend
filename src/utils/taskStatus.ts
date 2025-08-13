// Task Status Management Utility
// Handles mapping between Backend Status and Frontend Display Status

// Backend status enum (from API)
export enum BackendStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  TESTING = 'TESTING',
  BLOCKED = 'BLOCKED',
  REVIEW = 'REVIEW'
}

// Frontend display status (for UI)
export enum FrontendStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress', 
  COMPLETED = 'completed',
  TESTING = 'testing',
  BLOCKED = 'blocked',
  REVIEW = 'review'
}

// Status display configuration
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  group: 'todo' | 'in_progress' | 'completed' | 'other';
  icon?: string;
}

export const STATUS_CONFIG: Record<FrontendStatus, StatusConfig> = {
  [FrontendStatus.PENDING]: {
    label: 'To Do',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    group: 'todo',
    icon: '⚪'
  },
  [FrontendStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    group: 'in_progress',
    icon: '🟡'
  },
  [FrontendStatus.TESTING]: {
    label: 'Testing',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    group: 'in_progress',
    icon: '🔵'
  },
  [FrontendStatus.REVIEW]: {
    label: 'In Review',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    group: 'in_progress',
    icon: '🟣'
  },
  [FrontendStatus.BLOCKED]: {
    label: 'Blocked',
    color: '#dc2626',
    bgColor: '#fee2e2',
    group: 'other',
    icon: '🔴'
  },
  [FrontendStatus.COMPLETED]: {
    label: 'Completed',
    color: '#10b981',
    bgColor: '#d1fae5',
    group: 'completed',
    icon: '✅'
  }
};

// Mapping: Backend Status → Frontend Status
export const BACKEND_TO_FRONTEND_STATUS: Record<BackendStatus, FrontendStatus> = {
  [BackendStatus.TODO]: FrontendStatus.PENDING,
  [BackendStatus.IN_PROGRESS]: FrontendStatus.IN_PROGRESS,
  [BackendStatus.DONE]: FrontendStatus.COMPLETED,
  [BackendStatus.TESTING]: FrontendStatus.TESTING,
  [BackendStatus.BLOCKED]: FrontendStatus.BLOCKED,
  [BackendStatus.REVIEW]: FrontendStatus.REVIEW
};

// Mapping: Frontend Status → Backend Status
export const FRONTEND_TO_BACKEND_STATUS: Record<FrontendStatus, BackendStatus> = {
  [FrontendStatus.PENDING]: BackendStatus.TODO,
  [FrontendStatus.IN_PROGRESS]: BackendStatus.IN_PROGRESS,
  [FrontendStatus.COMPLETED]: BackendStatus.DONE,
  [FrontendStatus.TESTING]: BackendStatus.TESTING,
  [FrontendStatus.BLOCKED]: BackendStatus.BLOCKED,
  [FrontendStatus.REVIEW]: BackendStatus.REVIEW
};

/**
 * Convert backend status to frontend status
 */
export const backendToFrontendStatus = (backendStatus: string): FrontendStatus => {
  const status = backendStatus as BackendStatus;
  return BACKEND_TO_FRONTEND_STATUS[status] || FrontendStatus.PENDING;
};

/**
 * Convert frontend status to backend status
 */
export const frontendToBackendStatus = (frontendStatus: FrontendStatus): BackendStatus => {
  return FRONTEND_TO_BACKEND_STATUS[frontendStatus] || BackendStatus.TODO;
};

/**
 * Get status configuration for display
 */
export const getStatusConfig = (frontendStatus: FrontendStatus): StatusConfig => {
  return STATUS_CONFIG[frontendStatus] || STATUS_CONFIG[FrontendStatus.PENDING];
};

/**
 * Check if status is completed
 */
export const isCompletedStatus = (status: FrontendStatus): boolean => {
  return status === FrontendStatus.COMPLETED;
};

/**
 * Check if status is in progress (including testing, review)
 */
export const isInProgressStatus = (status: FrontendStatus): boolean => {
  const config = getStatusConfig(status);
  return config.group === 'in_progress';
};

/**
 * Check if status is todo/pending
 */
export const isTodoStatus = (status: FrontendStatus): boolean => {
  const config = getStatusConfig(status);
  return config.group === 'todo';
};

/**
 * Group tasks by status for analytics/filtering
 */
export interface StatusGroups {
  todo: FrontendStatus[];
  in_progress: FrontendStatus[];
  completed: FrontendStatus[];
  other: FrontendStatus[];
}

export const STATUS_GROUPS: StatusGroups = {
  todo: [FrontendStatus.PENDING],
  in_progress: [FrontendStatus.IN_PROGRESS, FrontendStatus.TESTING, FrontendStatus.REVIEW],
  completed: [FrontendStatus.COMPLETED],
  other: [FrontendStatus.BLOCKED]
};

/**
 * Get all frontend statuses in a group
 */
export const getStatusesByGroup = (group: keyof StatusGroups): FrontendStatus[] => {
  return STATUS_GROUPS[group];
};

/**
 * Filter tasks by status group
 */
export const filterTasksByStatusGroup = <T extends { status: string }>(
  tasks: T[],
  group: keyof StatusGroups
): T[] => {
  const statuses = getStatusesByGroup(group);
  return tasks.filter(task => statuses.includes(task.status as FrontendStatus));
};

/**
 * Count tasks by status groups
 */
export const getTaskCountsByGroup = <T extends { status: string }>(tasks: T[]) => {
  return {
    todo: filterTasksByStatusGroup(tasks, 'todo').length,
    in_progress: filterTasksByStatusGroup(tasks, 'in_progress').length,
    completed: filterTasksByStatusGroup(tasks, 'completed').length,
    other: filterTasksByStatusGroup(tasks, 'other').length,
    total: tasks.length
  };
};