// Task Data Hooks - Pure data fetching with SWR
import useSWR from 'swr';
import { tasksService } from '@/services/tasks';
import type { TaskFilter, TaskSort } from '@/services/tasks';

// SWR Key generators for consistent cache keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: { filter?: TaskFilter; sort?: TaskSort; page?: number; limit?: number }) => 
    [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  byProject: (projectId: string, params?: any) => [...taskKeys.all, 'project', projectId, params] as const,
  
  // My Tasks keys
  myTasks: () => [...taskKeys.all, 'my-tasks'] as const,
  myTasksList: (params?: { page?: number; size?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }) => 
    [...taskKeys.myTasks(), 'list', params] as const,
  myTasksSummary: (params?: { page?: number; size?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }) => 
    [...taskKeys.myTasks(), 'summary', params] as const,
};

// Hook: Get tasks with filters, sorting, and pagination
export const useTasksData = (params?: {
  filter?: TaskFilter;
  sort?: TaskSort;
  page?: number;
  limit?: number;
}) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskKeys.list(params),
    () => tasksService.getTasks(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      keepPreviousData: true,
      refreshInterval: 0,
    }
  );

  return {
    tasks: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get single task by ID
export const useTaskData = (id: string | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    id ? taskKeys.detail(id) : null,
    () => id ? tasksService.getTask(id) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    task: data,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get tasks by projects
export const useTasksByProjectData = (
  projectId: string | null,
  params?: {
    filter?: Omit<TaskFilter, 'projectId'>;
    sort?: TaskSort;
  }
) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    projectId ? taskKeys.byProject(projectId, params) : null,
    () => projectId ? tasksService.getTasksByProject(projectId, params) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    tasks: data || [],
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get My Tasks (Full Data) with pagination
export const useMyTasksData = (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskKeys.myTasksList(params),
    () => tasksService.getMyTasks(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      keepPreviousData: true,
      refreshInterval: 0,
    }
  );

  return {
    tasks: data?.tasks || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 0,
    pageSize: data?.pageSize || 10,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get My Tasks Summary (Lightweight) with pagination
export const useMyTasksSummaryData = (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}) => {
  // Standardize parameters to reduce duplicate cache keys
  const standardizedParams = {
    page: params?.page ?? 0,
    size: params?.size ?? 1000,        // Large size to cover all needs
    sortBy: params?.sortBy ?? 'startDate',  // Standard sort field
    sortDir: params?.sortDir ?? 'desc'      // Standard direction
  };
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskKeys.myTasksSummary(standardizedParams),
    () => tasksService.getMyTasksSummary(standardizedParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 1,        // Reduce retries to avoid spam
      errorRetryInterval: 5000,  // Longer interval between retries
      keepPreviousData: true,
      refreshInterval: 0,
    }
  );

  return {
    tasks: data?.tasks || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 0,
    pageSize: data?.pageSize || 20,
    isLoading,
    error,
    revalidate,
  };
};