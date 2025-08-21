// Project Tasks Hooks - SWR integration for project task management
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { 
  projectTaskService, 
  type CreateProjectTaskRequest, 
  type UpdateProjectTaskRequest,
  type ProjectTaskResponseDto,
  type ProjectTaskFilters,
  type PaginatedProjectTasksResponse 
} from '@/services/tasks/projectTaskService';

// SWR Keys
const KEYS = {
  PROJECT_TASKS: (filters?: ProjectTaskFilters) => 
    ['project-tasks', filters ? JSON.stringify(filters) : 'all'],
  PROJECT_TASKS_BY_PROJECT: (projectId: number, page = 0, size = 20) => 
    ['project-tasks', 'project', projectId, page, size],
  PROJECT_TASK: (taskId: number) => ['project-tasks', taskId],
  PROJECT_TASK_STATS: (projectId: number) => ['project-tasks', 'stats', projectId],
  OVERDUE_TASKS: (projectId: number) => ['project-tasks', 'overdue', projectId],
  SUBTASKS: (taskId: number) => ['project-tasks', 'subtasks', taskId],
};

// Get all project tasks with filtering
export const useProjectTasks = (filters?: ProjectTaskFilters) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    KEYS.PROJECT_TASKS(filters),
    () => projectTaskService.getTasks(filters || {}),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    tasks: data?.content || [],
    pagination: data ? {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.pageable.pageNumber,
      pageSize: data.pageable.pageSize,
      first: data.first,
      last: data.last,
    } : null,
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
};

// Get tasks by specific project
export const useProjectTasksByProject = (projectId: number, page = 0, size = 20) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    projectId ? KEYS.PROJECT_TASKS_BY_PROJECT(projectId, page, size) : null,
    async () => {
      try {
        return await projectTaskService.getTasksByProject(projectId, page, size);
      } catch (error: any) {
        // Check if it's a 404 error (API endpoint not implemented yet)
        if (error?.response?.status === 404 || error?.status === 404) {
          console.warn('⚠️ Project tasks API endpoint not implemented yet, using fallback');
          
          // Return mock structure for development
          return {
            content: [],
            pageable: { pageNumber: page, pageSize: size },
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true
          };
        }
        throw error; // Re-throw other errors
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      // Don't retry on 404 errors
      errorRetryCount: (error) => error?.response?.status === 404 ? 0 : 3,
    }
  );

  return {
    tasks: data?.content || [],
    pagination: data ? {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.pageable.pageNumber,
      pageSize: data.pageable.pageSize,
      first: data.first,
      last: data.last,
    } : null,
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
};

// Get single project task
export const useProjectTask = (taskId: number | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskId ? KEYS.PROJECT_TASK(taskId) : null,
    () => taskId ? projectTaskService.getTaskById(taskId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    task: data || null,
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
};

// Create project task mutation
export const useCreateProjectTask = () => {
  return useSWRMutation(
    'create-project-task',
    async (key: string, { arg }: { arg: CreateProjectTaskRequest }) => {
      // Create optimistic task for instant UI
      const optimisticTask = {
        id: Date.now(), // Temporary ID
        title: arg.title,
        description: arg.description || '',
        status: arg.status || 'TODO',
        priority: arg.priority || 'MEDIUM',
        startDate: arg.startDate,
        deadline: arg.deadline,
        progressPercentage: arg.progressPercentage || 0,
        projectId: arg.projectId,
        assigneeName: null,
        assigneeEmail: null,
        additionalAssignees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update - add task instantly
      mutate(
        (key) => Array.isArray(key) && key[0] === 'project-tasks',
        (currentData: any) => {
          if (currentData?.content) {
            return { 
              ...currentData, 
              content: [optimisticTask, ...currentData.content],
              totalElements: currentData.totalElements + 1
            };
          }
          if (Array.isArray(currentData)) {
            return [optimisticTask, ...currentData];
          }
          return [optimisticTask];
        },
        false // No revalidation = no loading
      );

      try {
        // Make actual API call
        const newTask = await projectTaskService.createTask(arg);
        
        // Replace optimistic task with real task
        mutate(
          (key) => Array.isArray(key) && key[0] === 'project-tasks',
          (currentData: any) => {
            if (currentData?.content) {
              const updatedTasks = currentData.content.map((task: any) =>
                task.id === optimisticTask.id ? newTask : task
              );
              return { ...currentData, content: updatedTasks };
            }
            if (Array.isArray(currentData)) {
              return currentData.map((task: any) =>
                task.id === optimisticTask.id ? newTask : task
              );
            }
            return [newTask];
          },
          false
        );
        
        return newTask;
      } catch (error) {
        // Rollback optimistic update on error
        mutate(
          (key) => Array.isArray(key) && key[0] === 'project-tasks',
          (currentData: any) => {
            if (currentData?.content) {
              const filteredTasks = currentData.content.filter((task: any) => 
                task.id !== optimisticTask.id
              );
              return { 
                ...currentData, 
                content: filteredTasks,
                totalElements: currentData.totalElements - 1
              };
            }
            if (Array.isArray(currentData)) {
              return currentData.filter((task: any) => task.id !== optimisticTask.id);
            }
            return [];
          },
          false
        );
        throw error;
      }
    }
  );
};

// Update project task mutation with optimistic updates
export const useUpdateProjectTask = () => {
  return useSWRMutation(
    'update-project-task',
    async (key: string, { arg }: { arg: { taskId: number; updates: UpdateProjectTaskRequest } }) => {
      const { taskId, updates } = arg;
      
      // Optimistic update - update cache first for instant UI
      mutate(
        (key) => Array.isArray(key) && key[0] === 'project-tasks',
        (currentData: any) => {
          if (currentData?.content) {
            const updatedTasks = currentData.content.map((task: any) => 
              task.id === taskId ? { ...task, ...updates } : task
            );
            return { ...currentData, content: updatedTasks };
          }
          if (Array.isArray(currentData)) {
            return currentData.map((task: any) => 
              task.id === taskId ? { ...task, ...updates } : task
            );
          }
          return currentData;
        },
        false // No revalidation = no loading
      );

      try {
        // Make actual API call
        const updatedTask = await projectTaskService.updateTask(taskId, updates);
        
        // Update cache with real data (no revalidation needed)
        mutate(
          (key) => Array.isArray(key) && key[0] === 'project-tasks',
          (currentData: any) => {
            if (currentData?.content) {
              const updatedTasks = currentData.content.map((task: any) => 
                task.id === taskId ? updatedTask : task
              );
              return { ...currentData, content: updatedTasks };
            }
            if (Array.isArray(currentData)) {
              return currentData.map((task: any) => 
                task.id === taskId ? updatedTask : task
              );
            }
            return currentData;
          },
          false
        );
        
        return updatedTask;
      } catch (error) {
        // Rollback optimistic update on error
        mutate(
          (key) => Array.isArray(key) && key[0] === 'project-tasks',
          undefined,
          { revalidate: true }
        );
        throw error;
      }
    }
  );
};

// Delete project task mutation with optimistic updates
export const useDeleteProjectTask = () => {
  return useSWRMutation(
    'delete-project-task',
    async (key: string, { arg }: { arg: number }) => {
      const taskId = arg;
      
      // Store deleted task for rollback
      let deletedTask: any = null;
      
      // Optimistic update - remove task instantly
      mutate(
        (key) => Array.isArray(key) && key[0] === 'project-tasks',
        (currentData: any) => {
          if (currentData?.content) {
            deletedTask = currentData.content.find((task: any) => task.id === taskId);
            const filteredTasks = currentData.content.filter((task: any) => task.id !== taskId);
            return { 
              ...currentData, 
              content: filteredTasks,
              totalElements: Math.max(0, currentData.totalElements - 1)
            };
          }
          if (Array.isArray(currentData)) {
            deletedTask = currentData.find((task: any) => task.id === taskId);
            return currentData.filter((task: any) => task.id !== taskId);
          }
          return currentData;
        },
        false // No revalidation = no loading
      );

      try {
        // Make actual API call
        await projectTaskService.deleteTask(taskId);
        
        // Remove from individual cache
        mutate(KEYS.PROJECT_TASK(taskId), undefined, { revalidate: false });
        
        return taskId;
      } catch (error) {
        // Rollback optimistic update on error
        if (deletedTask) {
          mutate(
            (key) => Array.isArray(key) && key[0] === 'project-tasks',
            (currentData: any) => {
              if (currentData?.content) {
                return { 
                  ...currentData, 
                  content: [deletedTask, ...currentData.content],
                  totalElements: currentData.totalElements + 1
                };
              }
              if (Array.isArray(currentData)) {
                return [deletedTask, ...currentData];
              }
              return [deletedTask];
            },
            false
          );
        }
        throw error;
      }
    }
  );
};

// Update task status mutation
export const useUpdateProjectTaskStatus = () => {
  return useSWRMutation(
    'update-project-task-status',
    async (key: string, { arg }: { arg: { taskId: number; status: string } }) => {
      const { taskId, status } = arg;
      const updatedTask = await projectTaskService.updateTaskStatus(taskId, status);
      
      // Update specific task cache
      await mutate(KEYS.PROJECT_TASK(taskId), updatedTask, { revalidate: false });
      
      // Revalidate task lists
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'project-tasks',
        undefined,
        { revalidate: true }
      );
      
      return updatedTask;
    }
  );
};

// Update task progress mutation
export const useUpdateProjectTaskProgress = () => {
  return useSWRMutation(
    'update-project-task-progress',
    async (key: string, { arg }: { arg: { taskId: number; progress: number } }) => {
      const { taskId, progress } = arg;
      await projectTaskService.updateTaskProgress(taskId, progress);
      
      // Revalidate specific task and lists
      await mutate(KEYS.PROJECT_TASK(taskId));
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'project-tasks',
        undefined,
        { revalidate: true }
      );
      
      return { taskId, progress };
    }
  );
};

// Assign task mutation
export const useAssignProjectTask = () => {
  return useSWRMutation(
    'assign-project-task',
    async (key: string, { arg }: { arg: { taskId: number; userId: number } }) => {
      const { taskId, userId } = arg;
      await projectTaskService.assignTask(taskId, userId);
      
      // Revalidate specific task and lists
      await mutate(KEYS.PROJECT_TASK(taskId));
      await mutate(
        (key) => Array.isArray(key) && key[0] === 'project-tasks',
        undefined,
        { revalidate: true }
      );
      
      return { taskId, userId };
    }
  );
};

// Get project task statistics
export const useProjectTaskStats = (projectId: number | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    projectId ? KEYS.PROJECT_TASK_STATS(projectId) : null,
    () => projectId ? projectTaskService.getProjectTaskStats(projectId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    stats: data || null,
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
};

// Get overdue tasks
export const useOverdueProjectTasks = (projectId: number | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    projectId ? KEYS.OVERDUE_TASKS(projectId) : null,
    () => projectId ? projectTaskService.getOverdueTasks(projectId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // Cache for 2 minutes
    }
  );

  return {
    overdueTasks: data || [],
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
};

// Get subtasks
export const useProjectTaskSubtasks = (taskId: number | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    taskId ? KEYS.SUBTASKS(taskId) : null,
    () => taskId ? projectTaskService.getSubtasks(taskId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    subtasks: data || [],
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
};

// Comprehensive project task actions hook
export const useProjectTaskActions = () => {
  const createMutation = useCreateProjectTask();
  const updateMutation = useUpdateProjectTask();
  const deleteMutation = useDeleteProjectTask();
  const updateStatusMutation = useUpdateProjectTaskStatus();
  const updateProgressMutation = useUpdateProjectTaskProgress();
  const assignMutation = useAssignProjectTask();

  return {
    // Create task
    createTask: async (taskData: CreateProjectTaskRequest) => {
      try {
        const result = await createMutation.trigger(taskData);
        return result;
      } catch (error) {
        console.error('Failed to create task:', error);
        throw error;
      }
    },

    // Update task
    updateTask: async (taskId: number, updates: UpdateProjectTaskRequest) => {
      try {
        const result = await updateMutation.trigger({ taskId, updates });
        return result;
      } catch (error) {
        console.error('Failed to update task:', error);
        throw error;
      }
    },

    // Delete task
    deleteTask: async (taskId: number) => {
      try {
        await deleteMutation.trigger(taskId);
        return taskId;
      } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
      }
    },

    // Update status
    updateTaskStatus: async (taskId: number, status: string) => {
      try {
        const result = await updateStatusMutation.trigger({ taskId, status });
        return result;
      } catch (error) {
        console.error('Failed to update task status:', error);
        throw error;
      }
    },

    // Update progress
    updateTaskProgress: async (taskId: number, progress: number) => {
      try {
        const result = await updateProgressMutation.trigger({ taskId, progress });
        return result;
      } catch (error) {
        console.error('Failed to update task progress:', error);
        throw error;
      }
    },

    // Assign task
    assignTask: async (taskId: number, userId: number) => {
      try {
        const result = await assignMutation.trigger({ taskId, userId });
        return result;
      } catch (error) {
        console.error('Failed to assign task:', error);
        throw error;
      }
    },

    // Loading states
    loading: {
      creating: createMutation.isMutating,
      updating: updateMutation.isMutating,
      deleting: deleteMutation.isMutating,
      updatingStatus: updateStatusMutation.isMutating,
      updatingProgress: updateProgressMutation.isMutating,
      assigning: assignMutation.isMutating,
    },

    // Error states
    errors: {
      create: createMutation.error,
      update: updateMutation.error,
      delete: deleteMutation.error,
      updateStatus: updateStatusMutation.error,
      updateProgress: updateProgressMutation.error,
      assign: assignMutation.error,
    }
  };
};