// TaskList Component - Clean exports for easy importing

// Main components
export { default as TaskList } from './TaskList';
export { default as TaskTable } from './TaskTable';
export { default as TaskSection } from './TaskSection';
export { default as TaskListHeader } from './TaskListHeader';
export { default as TaskRow } from './TaskRow';
export { default as TaskCard } from './TaskCard';

export { default as BucketTaskList } from './BucketTaskList';




// Legacy component aliases for backward compatibility
export { default as TaskHeader } from './TaskListHeader';

// Types
export type {
  TaskListItem,
  TaskAssignee,
  TaskPriority,
  TaskStatus,
  TaskActionTime,
  TaskGroupBy,
  TaskSection as TaskSectionType,
  TaskListConfig,
  TaskListActions,
  TaskListFilters,
  TaskListSort,
  TaskTableColumn,
  NewTaskDataType,
} from './types';

// Utils
export {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  DEFAULT_COLUMNS,
  getPriorityConfig,
  getStatusConfig,
  formatDate,
  isOverdue,
  groupTasks,
  groupTasksByStatus,
  groupTasksByPriority,
  groupTasksByAssignmentDate,
  sortTasks,
  filterTasks,
  // Legacy compatibility functions
  getPriorityColor,
  getStatusColor,
  getDueDateColor,
} from './utils';