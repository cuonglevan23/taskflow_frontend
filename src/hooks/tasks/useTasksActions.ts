// Task Actions Hooks - CRUD operations with SWR mutations
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { taskService } from '@/services/task';
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

      // Add optimistic task to cache
      mutate(
        (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary',
        (currentData: any) => {
          if (currentData?.tasks) {
            const updatedTasks = [optimisticTask, ...currentData.tasks];
            return {
              ...currentData,
              tasks: updatedTasks,
              totalElements: currentData.totalElements + 1
            };
          }
          return currentData;
        },
        false
      );

      try {
        // Make actual API call
        const newTask = await taskService.createTask(arg);
        
        // Replace optimistic task with real task - Fix ID matching
        mutate(
          (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary',
          (currentData: any) => {
            if (currentData?.tasks) {
              // Remove optimistic task and add real task
              const updatedTasks = currentData.tasks
                .filter((task: Task) => task.id !== optimisticTask.id) // Remove optimistic
                .concat([newTask]); // Add real task
              

              
              return {
                ...currentData,
                tasks: updatedTasks
              };
            }
            return currentData;
          },
          false
        );

        // Cache update already handled by optimistic update above

        return newTask;
      } catch (error) {
        // Rollback optimistic update
        mutate(
          (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary',
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
        const updatedTask = await taskService.updateTask(id, data);
        
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

        // Update My Tasks Summary cache
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
        await taskService.deleteTask(taskId);
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
      const updatedTask = await taskService.unassignTask(arg);
      
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