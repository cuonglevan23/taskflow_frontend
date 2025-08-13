// TaskList Component - Clean exports for easy importing

// Main components
export { default as TaskList } from './TaskList';
export { default as TaskTable } from './TaskTable';
export { default as TaskSection } from './TaskSection';
export { default as TaskListHeader } from './TaskListHeader';
export { default as TaskRow } from './TaskRow';
export { default as TaskCard } from './TaskCard';

// Enhanced components for Asana/ClickUp style grouped task lists
export { default as GroupedTaskList } from './GroupedTaskList';
export { default as EnhancedTaskSection } from './EnhancedTaskSection';
export { default as EnhancedTaskRow } from './EnhancedTaskRow';



// Legacy component aliases for backward compatibility
export { default as TaskHeader } from './TaskListHeader';

// Types
export type {
  TaskListItem,
  TaskAssignee,
  TaskPriority,
  TaskStatus,
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