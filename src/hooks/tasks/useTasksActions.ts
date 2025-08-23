import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { tasksService } from '@/services/tasks';
import { taskKeys } from './useTasksData';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types/task';


// Mutation Hook: Create task with optimistic updates
export const useCreateTask = () => {

  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: CreateTaskDTO }) => {
      // Create optimistic task with proper date format to match backend
      const optimisticId = `temp_${Date.now()}`;
      const now = new Date();
      
      // Parse deadline properly for optimistic task
      let taskDate = now;
      let taskDateString = 'Today';
      
      // Always use calendar click date (dueDateISO) - no string parsing needed
      if (arg.dueDateISO) {
        taskDate = arg.dueDateISO;
        taskDateString = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
      }
      
      const optimisticTask: Task = {
        id: optimisticId as any,
        title: arg.title,
        description: arg.description || '',
        dueDate: taskDateString,
        dueDateISO: taskDate,
        completed: false,
        priority: arg.priority || 'medium',
        status: arg.status || 'pending',
        hasTag: false,
        tags: arg.tags || [],
        createdAt: now,
        updatedAt: now,
        projectId: arg.projectId,
        assigneeId: arg.assigneeId,
        startDate: taskDate,
        endDate: taskDate,
      };

      // Add optimistic task to cache - use specific cache key with params
      mutate(
        ['tasks', 'my-tasks', 'summary', {
          page: 0,
          size: 1000,
          sortBy: 'startDate',
          sortDir: 'desc'
        }],
        (currentData: any) => {
          if (currentData?.tasks) {
            const updatedTasks = [optimisticTask, ...currentData.tasks];
            return {
              ...currentData,
              tasks: updatedTasks,
              totalElements: currentData.totalElements + 1
            };
          }
          return { tasks: [optimisticTask] };
        },
        false
      );

      try {
        // Make actual API call
        const newTask = await tasksService.createTask(arg);
        
        // ✅ FIX: No need for GlobalDataContext update since we're using SWR everywhere now
        // addTask(newTask); // Removed - causes duplicate tasks
        
        // ✅ FIX: Properly replace optimistic task with real task
        mutate(
          ['tasks', 'my-tasks', 'summary', {
            page: 0,
            size: 1000,
            sortBy: 'startDate',
            sortDir: 'desc'
          }],
          (currentData: any) => {
            if (currentData?.tasks) {
              // Remove optimistic task and add real task
              const filteredTasks = currentData.tasks.filter((task: Task) => {
                const isOptimistic = String(task.id) === String(optimisticTask.id);
                return !isOptimistic;
              });
              
              const updatedTasks = [newTask, ...filteredTasks]; // Add real task first
              
              return {
                ...currentData,
                tasks: updatedTasks,
                totalElements: currentData.totalElements // Keep same count
              };
            }
            return { tasks: [newTask] };
          },
          false
        );

        // ✅ INSTANT UI UPDATE: No revalidation = no loading state
        // Task appears immediately in UI through optimistic update above
        
        // ✅ SILENT BACKGROUND SYNC: Only update cache with real data when API succeeds
        // Replace optimistic task with real task from server
        mutate(
          ['tasks', 'my-tasks', 'summary', {
            page: 0,
            size: 1000,
            sortBy: 'startDate',
            sortDir: 'desc'
          }],
          (currentData: any) => {
            if (currentData?.tasks) {
              // Silently replace optimistic task with real task
              const updatedTasks = currentData.tasks.map((task: Task) => 
                String(task.id) === String(optimisticTask.id) ? newTask : task
              );
              return {
                ...currentData,
                tasks: updatedTasks
              };
            }
            return currentData;
          },
          false // ⚠️ CRITICAL: false = no revalidation = no loading state
        );

        // ✅ SILENT CACHE UPDATES: Update other views silently in background
        // This ensures consistency across all components without loading UI
        setTimeout(() => {
          // Update stats cache silently
          mutate(
            (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'stats',
            undefined,
            { revalidate: false, populateCache: false }
          );
          
          // Update general tasks list silently
          mutate(
            (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list',
            undefined,  
            { revalidate: false, populateCache: false }
          );
        }, 100); // Small delay to avoid UI glitches

        return newTask;
      } catch (error) {
        // Rollback optimistic update - use specific cache key with params
        mutate(
          ['tasks', 'my-tasks', 'summary', {
            page: 0,
            size: 1000,
            sortBy: 'startDate',
            sortDir: 'desc'
          }],
          (currentData: any) => {
            if (currentData?.tasks) {
              return {
                ...currentData,
                tasks: currentData.tasks.filter((task: Task) => task.id !== optimisticTask.id),
                totalElements: currentData.totalElements - 1
              };
            }
            return currentData;
          },
          false
        );
        throw error;
      }
    }
  );

  return {
    createTask: trigger,
    isCreating: isMutating,
    error,
  };
};

// Mutation Hook: Update task with optimistic updates
export const useUpdateTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: { id: string; data: UpdateTaskDTO } }) => {
      const { id, data } = arg;
      let previousData: any = null;

      // Optimistic update
      mutate(
        (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list',
        (currentData: any) => {
          if (currentData?.data) {
            previousData = currentData;
            const updatedData = currentData.data.map((task: Task) => 
              task.id.toString() === id ? { ...task, ...data, updatedAt: new Date() } : task
            );
            return {
              ...currentData,
              data: updatedData
            };
          }
          return currentData;
        },
        false
      );

      try {
        const updatedTask = await tasksService.updateTask(id, data);
        
        // ✅ FIX: No longer needed - SWR handles all updates
        // updateGlobalTask(taskId, updatedTask); // Removed - using SWR only
        
        // Update cache with real data
        mutate(taskKeys.detail(id), updatedTask, true);
        mutate(
          (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list',
          (currentData: any) => {
            if (currentData?.data) {
              const updatedData = currentData.data.map((task: Task) => 
                task.id.toString() === id ? updatedTask : task
              );
              return {
                ...currentData,
                data: updatedData
              };
            }
            return currentData;
          },
          true
        );

        // Update My Tasks Summary cache - Fixed cache key matching
        mutate(
          (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary',
          (currentData: any) => {
            if (currentData?.tasks) {
              const updatedTasks = currentData.tasks.map((task: Task) => 
                task.id.toString() === id ? updatedTask : task
              );
              return {
                ...currentData,
                tasks: updatedTasks
              };
            }
            return currentData;
          },
          true
        );

        // ✅ FIX: Also force revalidate My Tasks Summary to ensure UI sync
        mutate((key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary');

        return updatedTask;
      } catch (error) {
        // Rollback optimistic update
        if (previousData) {
          mutate(
            (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list',
            previousData,
            false
          );
        }
        throw error;
      }
    }
  );

  return {
    updateTask: trigger,
    isUpdating: isMutating,
    error,
  };
};

// Mutation Hook: Delete task with optimistic updates
export const useDeleteTask = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    taskKeys.all,
    async (key, { arg }: { arg: string }) => {
      const taskId = arg;
      let deletedTask: Task | null = null;
      let previousData: any = null;

      // Optimistic update - remove from UI immediately
      mutate(
        (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list',
        (currentData: any) => {
          if (currentData?.data) {
            previousData = currentData;
            deletedTask = currentData.data.find((task: Task) => task.id.toString() === taskId);
            const filteredData = currentData.data.filter((task: Task) => task.id.toString() !== taskId);
            return {
              ...currentData,
              data: filteredData,
              total: currentData.total - 1
            };
          }
          return currentData;
        },
        false
      );

      // Remove from My Tasks Summary cache
      mutate(
        (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary',
        (currentData: any) => {
          if (currentData?.tasks) {
            const filteredTasks = currentData.tasks.filter((task: Task) => task.id.toString() !== taskId);
            return {
              ...currentData,
              tasks: filteredTasks,
              totalElements: currentData.totalElements - 1
            };
          }
          return currentData;
        },
        false
      );

      // Remove from detail cache
      mutate(taskKeys.detail(taskId), undefined, false);

      try {
        await tasksService.deleteTask(taskId);
        
        // ✅ FIX: No longer needed - SWR handles all updates
        // updateGlobalTask(taskIdNum, { deleted: true }); // Removed - using SWR only
        
        return taskId;
      } catch (error) {
        // Rollback optimistic update
        if (previousData) {
          mutate(
            (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'list',
            previousData,
            false
          );
          mutate(
            (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary',
            previousData,
            false
          );
        }
        if (deletedTask) {
          mutate(taskKeys.detail(taskId), deletedTask, false);
        }
        throw error;
      }
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
      let previousData: any = null;
      
      // Optimistic update - instant UI response
      mutate(
        (cacheKey) => {
          if (!Array.isArray(cacheKey)) return false;
          return cacheKey[0] === 'tasks' && cacheKey[1] === 'my-tasks' && cacheKey[2] === 'summary';
        },
        (currentData: any) => {
          if (!currentData?.tasks) return currentData;
          
          // Store original for potential rollback
          previousData = currentData;
          
          return {
            ...currentData,
            tasks: currentData.tasks.map((task: Task) => 
              task.id.toString() === id 
                ? { ...task, status, updatedAt: new Date() }
                : task
            )
          };
        },
        false // No revalidation during optimistic update
      );
      
      try {
        // API call
        const updatedTask = await tasksService.updateTaskStatus(id, status);
        
        // Update specific task cache
        mutate(taskKeys.detail(id), updatedTask, false);
        
        return updatedTask;
      } catch (error) {
        // Rollback optimistic update on error
        if (previousData) {
          mutate(
            (cacheKey) => Array.isArray(cacheKey) && cacheKey[0] === 'tasks' && cacheKey[1] === 'my-tasks' && cacheKey[2] === 'summary',
            previousData,
            false
          );
        }
        throw error;
      }
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
      const updatedTask = await tasksService.assignTask(id, userId);
      
      // Update cache
      mutate(taskKeys.detail(id), updatedTask, false);
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
      const updatedTask = await tasksService.unassignTask(arg);
      
      // Update cache
      mutate(taskKeys.detail(arg), updatedTask, false);
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
      const updatedTasks = await tasksService.bulkUpdateTasks(arg);
      
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

// Utility functions for cache management
export const revalidateAllTasks = () => {
  mutate((key) => Array.isArray(key) && key[0] === 'tasks');
};

export const revalidateTask = (id: string) => {
  mutate(taskKeys.detail(id));
};

export const revalidateMyTasks = () => {
  mutate((key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks');
};

export const optimisticUpdateTask = (id: string, updates: Partial<Task>) => {
  mutate(
    taskKeys.detail(id),
    (currentTask: Task | undefined) => 
      currentTask ? { ...currentTask, ...updates } : undefined,
    false
  );
};