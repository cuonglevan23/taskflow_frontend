// Tasks Service - Barrel exports
export * from './tasksService';

// Re-export for backward compatibility
export { tasksService as taskService } from './tasksService';

// Re-export types
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