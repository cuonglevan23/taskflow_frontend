/**
 * Tasks Provider - State management for tasks using React Query
 */

"use client";

import React, { ReactNode, useState, useMemo, useCallback } from "react";
import { TasksContext, TasksContextType } from '@/contexts/tasks/Tasks.context';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types/task';
import { TaskFilter, TaskSort } from '@/services/task';
import { 
  useTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask, 
  useBulkUpdateTasks,
  useUpdateTaskStatus,
  useAssignTask
} from '@/hooks/queries/useTasks';

interface TasksProviderProps {
  children: ReactNode;
  initialFilters?: TaskFilter;
  initialSort?: TaskSort;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({
  children,
  initialFilters = {},
  initialSort = { field: 'startDate', direction: 'desc' } // Sort by startDate instead of createdAt
}) => {
  // Local state for filters and search
  const [filters, setFiltersState] = useState<TaskFilter>(initialFilters);
  const [sort, setSortState] = useState<TaskSort>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // React Query hooks
  const { 
    data: tasksResponse, 
    isLoading, 
    error: queryError 
  } = useTasks({ 
    filter: filters, 
    sort, 
    search: searchQuery 
  });

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const bulkUpdateMutation = useBulkUpdateTasks();
  const updateStatusMutation = useUpdateTaskStatus();
  const assignTaskMutation = useAssignTask();

  // Extract tasks from response
  const tasks = tasksResponse?.data || [];
  const loading = isLoading || createTaskMutation.isPending || updateTaskMutation.isPending;
  const error = queryError?.message || createTaskMutation.error?.message || updateTaskMutation.error?.message || null;

  // Action handlers
  const createTask = useCallback(async (data: CreateTaskDTO) => {
    await createTaskMutation.mutateAsync(data);
  }, [createTaskMutation]);

  const updateTask = useCallback(async (id: string, data: UpdateTaskDTO) => {
    await updateTaskMutation.mutateAsync({ id, data });
  }, [updateTaskMutation]);

  const deleteTask = useCallback(async (id: string) => {
    await deleteTaskMutation.mutateAsync(id);
  }, [deleteTaskMutation]);

  const bulkUpdateTasks = useCallback(async (updates: Array<{ id: string; data: Partial<UpdateTaskDTO> }>) => {
    await bulkUpdateMutation.mutateAsync(updates);
  }, [bulkUpdateMutation]);

  const updateTaskStatus = useCallback(async (id: string, status: Task['status']) => {
    await updateStatusMutation.mutateAsync({ id, status });
  }, [updateStatusMutation]);

  const assignTask = useCallback(async (id: string, userId: string) => {
    await assignTaskMutation.mutateAsync({ id, userId });
  }, [assignTaskMutation]);

  const unassignTask = useCallback(async (id: string) => {
    await updateTask(id, { assigneeId: undefined });
  }, [updateTask]);

  // Filter and search handlers
  const setFilters = useCallback((newFilters: Partial<TaskFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setSort = useCallback((newSort: TaskSort) => {
    setSortState(newSort);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchQuery('');
  }, []);

  // Utility functions
  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: Task['status']): Task[] => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Task['priority']): Task[] => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getTasksByAssignee = useCallback((userId: string): Task[] => {
    return tasks.filter(task => task.assigneeId === userId);
  }, [tasks]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const overdue = tasks.filter(task => 
      task.dueDateISO && task.dueDateISO < new Date() && task.status !== 'done'
    ).length;

    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Task['priority'], number>);

    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);

    return {
      total,
      completed,
      inProgress,
      overdue,
      byPriority,
      byStatus
    };
  }, [tasks]);

  // Context value
  const contextValue: TasksContextType = {
    // Data
    tasks,
    loading,
    error,
    
    // Filters and sorting
    filters,
    sort,
    searchQuery,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    updateTaskStatus,
    assignTask,
    unassignTask,
    
    // Filtering and search
    setFilters,
    setSort,
    setSearchQuery,
    clearFilters,
    
    // Utilities
    getTaskById,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByAssignee,
    
    // Statistics
    stats
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};