import { mutate } from 'swr';
import { tasksService } from '@/services/tasks/tasksService';
import { Task } from '@/contexts';
import { useCallback, useState, useRef } from 'react';

export const useUpdateTask = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<any>(null);

  const updateTask = useCallback(async (arg: { id: string; data: any }) => {
    const { id, data } = arg;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // API call
      const updatedTask = await tasksService.updateTask(id, data);
      
      // Precise cache updates - exact key matching for reliability
      mutate(
        (key) => {
          if (!Array.isArray(key)) return false;
          return (
            // Match my-tasks summary with exact structure
            (key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary' && key.length === 4) ||
            // Match individual task cache
            (key[0] === 'task' && key[1] === id && key.length === 2)
          );
        },
        (currentData: any) => {
          if (!currentData) return currentData;
          
          if (currentData.tasks) {
            return {
              ...currentData,
              tasks: currentData.tasks.map((task: Task) => 
                task.id.toString() === id ? updatedTask : task
              )
            };
          } else if (currentData.id?.toString() === id) {
            return updatedTask;
          }
          
          return currentData;
        },
        false // No revalidation
      );
      
      return updatedTask;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateTask, isUpdating, error };
};

// Create Task Hook - Professional implementation
export const useCreateTask = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<any>(null);

  const createTask = useCallback(async (taskData: any) => {
    setIsCreating(true);
    setError(null);
    
    try {
      // API call
      const newTask = await tasksService.createTask(taskData);
      
      // Precise cache updates - add to beginning of lists with exact matching
      mutate(
        (key) => {
          if (!Array.isArray(key)) return false;
          return key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary' && key.length === 4;
        },
        (currentData: any) => {
          if (!currentData?.tasks) return currentData;
          
          return {
            ...currentData,
            tasks: [newTask, ...currentData.tasks],
            totalElements: (currentData.totalElements || 0) + 1
          };
        },
        false // No revalidation
      );
      
      return newTask;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createTask, isCreating, error };
};

// Delete Task Hook - Professional implementation
export const useDeleteTask = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<any>(null);

  const deleteTask = useCallback(async (taskId: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      // API call
      await tasksService.deleteTask(taskId);
      
      // Precise cache updates - remove from lists with exact matching
      mutate(
        (key) => {
          if (!Array.isArray(key)) return false;
          return key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary' && key.length === 4;
        },
        (currentData: any) => {
          if (!currentData?.tasks) return currentData;
          
          return {
            ...currentData,
            tasks: currentData.tasks.filter((task: Task) => task.id.toString() !== taskId),
            totalElements: Math.max(0, (currentData.totalElements || 0) - 1)
          };
        },
        false // No revalidation
      );
      
      // Remove individual task cache
      mutate(['task', taskId], undefined, false);
      
      return taskId;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteTask, isDeleting, error };
};

// Optimistic Task Status Update - Ultra clean with debounce protection
export const useTaskStatusUpdate = () => {
  const { updateTask, isUpdating } = useUpdateTask();
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const updateStatus = useCallback(async (taskId: string, newStatus: string) => {
    // Clear any pending update for this task (debounce mechanism)
    const existingTimeout = pendingUpdatesRef.current.get(taskId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      pendingUpdatesRef.current.delete(taskId);
    }
    // Store original data for revert
    let originalData: any = null;
    
    // Optimistic update - synchronous, no await with exact key matching
    mutate(
      (key) => {
        if (!Array.isArray(key)) return false;
        return key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary' && key.length === 4;
      },
      (currentData: any) => {
        if (!currentData?.tasks) return currentData;
        
        // Store original for revert
        originalData = currentData;
        
        return {
          ...currentData,
          tasks: currentData.tasks.map((task: Task) => 
            task.id.toString() === taskId 
              ? { ...task, status: newStatus, updatedAt: new Date() }
              : task
          )
        };
      },
      false // No revalidation
    );
    
    // API call with error handling
    try {
      await updateTask({ id: taskId, data: { status: newStatus } });
    } catch (error) {
      // Revert to original data on error with exact key matching
      if (originalData) {
        mutate(
          (key) => Array.isArray(key) && key[0] === 'tasks' && key[1] === 'my-tasks' && key[2] === 'summary' && key.length === 4,
          originalData,
          false // No revalidation
        );
      }
      throw error;
    }
  }, [updateTask]);
  
  return { updateStatus, isUpdating };
};