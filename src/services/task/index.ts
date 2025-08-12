// Task Service Module - Clean Exports
export { taskService } from './service';
export { taskApi } from './api';
export { transformBackendTask, transformMyTasksSummary, transformMyTasksFull } from './transforms';
export { debugAuth } from './debug';

// Re-export all types directly from main types folder
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