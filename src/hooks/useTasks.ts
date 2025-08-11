// SWR Hooks for Task Management - Data fetching and caching
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { taskService, TaskFilter, TaskSort, TasksResponse } from '@/services/taskService';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types';

// SWR Key generators for consistent cache keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: { filter?: TaskFilter; sort?: TaskSort; page?: number; limit?: number }) => 
    [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: (filter?: TaskFilter) => [...taskKeys.all, 'stats', filter] as const,
  byProject: (projectId: string, params?: any) => [...taskKeys.all, 'project', projectId, params] as const,
};

// Hook: Get tasks with filters, sorting, and pagination
export const useTasks = (params?: {
  filter?: TaskFilter;
  sort?: TaskSort;
  page?: number;
  limit?: number;
}) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskKeys.list(params),
    () => taskService.getTasks(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
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
export const useTask = (id: string | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    id ? taskKeys.detail(id) : null,
    () => id ? taskService.getTask(id) : null,
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

// Hook: Get tasks by project
export const useTasksByProject = (
  projectId: string | null,
  params?: {
    filter?: Omit<TaskFilter, 'projectId'>;
    sort?: TaskSort;
  }
) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    projectId ? taskKeys.byProject(projectId, params) : null,
    () => projectId ? taskService.getTasksByProject(projectId, params) : null,
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

// Hook: Get task statistics
export const useTaskStats = (filter?: TaskFilter) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskKeys.stats(filter),
    () => taskService.getTaskStats(filter),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    revalidate,
  };
};

// Mutation Hook: Create task
export const useCreateTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: CreateTaskDTO }) => {
      const newTask = await taskService.createTask(arg);
      
      // Revalidate all task lists
      mutate((key) => Array.isArray(key) && key[0] === 'tasks');
      
      return newTask;
    }
  );

  return {
    createTask: trigger,
    isCreating: isMutating,
    error,
  };
};

// Mutation Hook: Update task
export const useUpdateTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: { id: string; data: UpdateTaskDTO } }) => {
      const { id, data } = arg;
      const updatedTask = await taskService.updateTask(id, data);
      
      // Update specific task in cache
      mutate(taskKeys.detail(id), updatedTask, false);
      
      // Revalidate all task lists
      mutate((key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list');
      
      return updatedTask;
    }
  );

  return {
    updateTask: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Mutation Hook: Delete task
export const useDeleteTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: string }) => {
      await taskService.deleteTask(arg);
      
      // Remove task from cache
      mutate(taskKeys.detail(arg), undefined, false);
      
      // Revalidate all task lists
      mutate((key) => Array.isArray(key) && key[0] === 'tasks');
      
      return arg;
    }
  );

  return {
    deleteTask: trigger,
    isDeleting: isMutating,
    error,
  };
};

// Mutation Hook: Update task status
export const useUpdateTaskStatus = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: { id: string; status: string } }) => {
      const { id, status } = arg;
      const updatedTask = await taskService.updateTaskStatus(id, status);
      
      // Update specific task in cache
      mutate(taskKeys.detail(id), updatedTask, false);
      
      // Revalidate task lists and stats
      mutate((key) => Array.isArray(key) && key[0] === 'tasks');
      
      return updatedTask;
    }
  );

  return {
    updateTaskStatus: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Mutation Hook: Assign task
export const useAssignTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: { id: string; userId: string } }) => {
      const { id, userId } = arg;
      const updatedTask = await taskService.assignTask(id, userId);
      
      // Update specific task in cache
      mutate(taskKeys.detail(id), updatedTask, false);
      
      // Revalidate task lists
      mutate((key) => Array.isArray(key) && key[0] === 'tasks');
      
      return updatedTask;
    }
  );

  return {
    assignTask: trigger,
    isAssigning: isMutating,
    error,
  };
};

// Mutation Hook: Unassign task
export const useUnassignTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: string }) => {
      const updatedTask = await taskService.unassignTask(arg);
      
      // Update specific task in cache
      mutate(taskKeys.detail(arg), updatedTask, false);
      
      // Revalidate task lists
      mutate((key) => Array.isArray(key) && key[0] === 'tasks');
      
      return updatedTask;
    }
  );

  return {
    unassignTask: trigger,
    isUnassigning: isMutating,
    error,
  };
};

// Mutation Hook: Bulk update tasks
export const useBulkUpdateTasks = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: Array<{ id: string; data: Partial<UpdateTaskDTO> }> }) => {
      const updatedTasks = await taskService.bulkUpdateTasks(arg);
      
      // Update individual tasks in cache
      updatedTasks.forEach(task => {
        mutate(taskKeys.detail(task.id), task, false);
      });
      
      // Revalidate all task lists
      mutate((key) => Array.isArray(key) && key[0] === 'tasks');
      
      return updatedTasks;
    }
  );

  return {
    bulkUpdateTasks: trigger,
    isBulkUpdating: isMutating,
    error,
  };
};

// Utility function to manually revalidate all task data
export const revalidateAllTasks = () => {
  mutate((key) => Array.isArray(key) && key[0] === 'tasks');
};

// Utility function to revalidate specific task
export const revalidateTask = (id: string) => {
  mutate(taskKeys.detail(id));
};

// Utility function to optimistically update task in cache
export const optimisticUpdateTask = (id: string, updates: Partial<Task>) => {
  mutate(
    taskKeys.detail(id),
    (currentTask: Task | undefined) => 
      currentTask ? { ...currentTask, ...updates } : undefined,
    false
  );
};