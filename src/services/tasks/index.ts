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

// Task-specific filter and sort interfaces
export interface TaskFilter {
  status?: string[];
  priority?: string[];
  assignee?: string;
  projectId?: number;
  teamId?: number;
}

export interface TaskSort {
  field: string;
  direction: 'asc' | 'desc';
}