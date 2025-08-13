// Task Hooks - Now uses modular architecture from hooks/tasks/
// This file is kept for backward compatibility

// Import everything from the new modular structure
export {
  // Data hooks
  useTasksData as useTasks,
  useTaskData as useTask,
  useTasksByProjectData as useTasksByProject,
  useMyTasksData as useMyTasks,
  useMyTasksSummaryData as useMyTasksSummary,
  taskKeys,
  
  // Action hooks  
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask,
  useUnassignTask,
  useBulkUpdateTasks,
  
  // Stats hooks
  useTaskStats,
  useMyTasksStats,
  
  // Utility functions
  revalidateAllTasks,
  revalidateTask,
  revalidateMyTasks,
  optimisticUpdateTask
} from './tasks';

// Re-export types for backward compatibility
export type { TaskFilter, TaskSort } from '@/services/tasks';