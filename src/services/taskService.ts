// Task Service - Task-related API operations
import { api } from './api';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types';

export const taskService = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Get tasks by project
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (id: string, status: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Assign task to user
  assignTask: async (id: string, userId: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/assign`, { userId });
    return response.data;
  },
};