/**
 * Tasks Context - Refactored for better maintainability
 * Split from the original 600-line file into modular components
 */

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types/task';
import { TaskFilter, TaskSort } from '@/services/tasks';

// Context Interface - Clean and focused
interface TasksContextType {
  // Data
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Filters and sorting
  filters: TaskFilter;
  sort: TaskSort;
  searchQuery: string;
  
  // Actions
  createTask: (data: CreateTaskDTO) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskDTO) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (updates: Array<{ id: string; data: Partial<UpdateTaskDTO> }>) => Promise<void>;
  
  // Status operations
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  assignTask: (id: string, userId: string) => Promise<void>;
  unassignTask: (id: string) => Promise<void>;
  
  // Filtering and search
  setFilters: (filters: Partial<TaskFilter>) => void;
  setSort: (sort: TaskSort) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Utilities
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByAssignee: (userId: string) => Task[];
  
  // Statistics
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    byPriority: Record<Task['priority'], number>;
    byStatus: Record<Task['status'], number>;
  };
}

// Create context
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Context hook
export const useTasksContext = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

// Export context for provider
export { TasksContext };
export type { TasksContextType };