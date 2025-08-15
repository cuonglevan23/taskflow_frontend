// Task Service - Now uses modular architecture from services/task/
// This file is kept for backward compatibility

// Import everything from the new modular structure
export { 
  transformBackendTask,
  transformMyTasksSummary,
  transformMyTasksFull,
} from './tasks/tasksService';

// Re-export types for backward compatibility
export type { 
  BackendTask, 
  Task, 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  TasksResponse,
  TaskStatsResponse,
  TaskQueryParams,
  BulkTaskUpdate,
  MyTasksSummaryItem,
  MyTasksFullItem,
  PaginatedResponse,
  MyTasksStats
} from '@/types/task';

// export type { TaskFilter, TaskSort } from './tasks/tasksService';

