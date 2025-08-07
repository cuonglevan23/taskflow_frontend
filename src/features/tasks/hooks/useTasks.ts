// Tasks Hook - Task state management
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (data: CreateTaskDTO) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskDTO) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<Task>;
  assignTask: (id: string, userId: string) => Promise<Task>;
  refreshTasks: () => Promise<void>;
}

export const useTasks = (projectId?: string): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedTasks = projectId 
        ? await taskService.getTasksByProject(projectId)
        : await taskService.getTasks();
      
      setTasks(fetchedTasks);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: CreateTaskDTO): Promise<Task> => {
    try {
      setError(null);
      const newTask = await taskService.createTask(data);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create task');
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    try {
      setError(null);
      const updatedTask = await taskService.updateTask(id, data);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update task');
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete task');
      throw error;
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: string): Promise<Task> => {
    try {
      setError(null);
      const updatedTask = await taskService.updateTaskStatus(id, status);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update task status');
      throw error;
    }
  }, []);

  const assignTask = useCallback(async (id: string, userId: string): Promise<Task> => {
    try {
      setError(null);
      const updatedTask = await taskService.assignTask(id, userId);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign task');
      throw error;
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    refreshTasks,
  };
};