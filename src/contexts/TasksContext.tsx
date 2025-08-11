"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SWRConfig } from 'swr';
import { TaskFilter, TaskSort } from '@/services/taskService';
import {
  useTasks,
  useTask,
  useTasksByProject,
  useTaskStats,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask,
  useUnassignTask,
  useBulkUpdateTasks,
} from '@/hooks/useTasks';

// Task Data Models - Centralized (keep existing types)
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // 'Today', 'Tomorrow', 'Thursday', etc.
  dueDateISO?: Date; // Actual date for sorting/filtering
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  projectId?: number;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  hasTag?: boolean;
  tagText?: string;
}

export interface AssignedTask extends Task {
  assignee: {
    id: string;
    name: string;
    avatar: string;
    color: string;
  };
}

export interface Goal {
  id: number;
  name: string;
  description?: string;
  progress: number; // 0-100
  period?: string;
  status: 'on-track' | 'at-risk' | 'off-track' | 'completed';
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  teamId?: string;
  ownerId: string;
}

// Context Interface - UI state and SWR hook references only
interface TasksContextType {
  // UI State - shared across components
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  
  activeView: 'list' | 'board' | 'calendar' | 'timeline';
  setActiveView: (view: 'list' | 'board' | 'calendar' | 'timeline') => void;
  
  globalFilters: TaskFilter;
  setGlobalFilters: (filters: TaskFilter) => void;
  
  globalSort: TaskSort;
  setGlobalSort: (sort: TaskSort) => void;
  
  // Modal states
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  
  isEditTaskModalOpen: boolean;
  setIsEditTaskModalOpen: (open: boolean) => void;
  
  // SWR Hook references - NOT data itself
  hooks: {
    useTasks: typeof useTasks;
    useTask: typeof useTask;
    useTasksByProject: typeof useTasksByProject;
    useTaskStats: typeof useTaskStats;
    useCreateTask: typeof useCreateTask;
    useUpdateTask: typeof useUpdateTask;
    useDeleteTask: typeof useDeleteTask;
    useUpdateTaskStatus: typeof useUpdateTaskStatus;
    useAssignTask: typeof useAssignTask;
    useUnassignTask: typeof useUnassignTask;
    useBulkUpdateTasks: typeof useBulkUpdateTasks;
  };
}

// Create Context
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// SWR Configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000, // 30 seconds
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  // Global error handler
  onError: (error: any) => {
    console.error('SWR Error:', error);
    // You can add global error handling here (toast notifications, etc.)
  },
  // Global success handler
  onSuccess: (data: any, key: string) => {
    // You can add global success handling here
    console.log('SWR Success:', key);
  },
};

// Provider Props
interface TasksProviderProps {
  children: ReactNode;
}

// Simple Tasks Provider - SWR + UI State only
export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  // UI State - only shared UI state, NO data
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'board' | 'calendar' | 'timeline'>('list');
  
  // Global filters and sorting (UI state, not data)
  const [globalFilters, setGlobalFilters] = useState<TaskFilter>({});
  const [globalSort, setGlobalSort] = useState<TaskSort>({
    field: 'createdAt',
    direction: 'desc'
  });
  
  // Modal states
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

  // Context value - UI state and hook references only
  const contextValue: TasksContextType = {
    // UI State
    sidebarOpen,
    setSidebarOpen,
    selectedTaskId,
    setSelectedTaskId,
    activeView,
    setActiveView,
    globalFilters,
    setGlobalFilters,
    globalSort,
    setGlobalSort,
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    isEditTaskModalOpen,
    setIsEditTaskModalOpen,
    
    // SWR Hook references - components will call these hooks directly
    hooks: {
      useTasks,
      useTask,
      useTasksByProject,
      useTaskStats,
      useCreateTask,
      useUpdateTask,
      useDeleteTask,
      useUpdateTaskStatus,
      useAssignTask,
      useUnassignTask,
      useBulkUpdateTasks,
    },
  };

  return (
    <SWRConfig value={swrConfig}>
      <TasksContext.Provider value={contextValue}>
        {children}
      </TasksContext.Provider>
    </SWRConfig>
  );
};

// Custom hook to use Tasks Context
export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

// Convenience hooks for specific UI state
export const useSidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useTasksContext();
  return { sidebarOpen, setSidebarOpen };
};

export const useSelectedTask = () => {
  const { selectedTaskId, setSelectedTaskId } = useTasksContext();
  return { selectedTaskId, setSelectedTaskId };
};

export const useActiveView = () => {
  const { activeView, setActiveView } = useTasksContext();
  return { activeView, setActiveView };
};

export const useGlobalFilters = () => {
  const { globalFilters, setGlobalFilters, globalSort, setGlobalSort } = useTasksContext();
  return { globalFilters, setGlobalFilters, globalSort, setGlobalSort };
};

export const useTaskModals = () => {
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    isEditTaskModalOpen,
    setIsEditTaskModalOpen,
  } = useTasksContext();
  
  return {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    isEditTaskModalOpen,
    setIsEditTaskModalOpen,
  };
};

// Hook to get SWR hooks (for components that need multiple hooks)
export const useTaskHooks = () => {
  const { hooks } = useTasksContext();
  return hooks;
};

// Export types for external use
export type { TasksContextType };