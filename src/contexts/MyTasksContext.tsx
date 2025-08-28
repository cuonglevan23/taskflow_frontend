"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMyTasksShared } from '@/hooks/tasks/useMyTasksShared';
import { TaskListItem, TaskStatus } from '@/components/TaskList/types';

interface MyTasksContextType {
  // Data
  taskListItems: TaskListItem[];
  isLoading: boolean;
  error: Error | null;
  
  // Task Detail Panel State
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
  
  // Actions
  actions: {
    onCreateTask: (taskData: Partial<TaskListItem>) => Promise<void>;
    onTaskEdit: (task: TaskListItem) => Promise<void>;
    onTaskDelete: (taskId: string) => Promise<void>;
    onTaskStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
    onTaskAssign: (taskId: string, assigneeIdOrEmail: string) => Promise<void>;
  };
  
  // Panel Actions
  openTaskDetail: (task: TaskListItem) => void;
  closeTaskDetail: () => void;
  setSelectedTask: (task: TaskListItem | null) => void;
  
  // Utility
  revalidate: () => void;
}

const MyTasksContext = createContext<MyTasksContextType | undefined>(undefined);

interface MyTasksProviderProps {
  children: React.ReactNode;
  searchValue?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const MyTasksProvider: React.FC<MyTasksProviderProps> = ({
  children,
  searchValue = '',
  page = 0,
  size = 1000,
  sortBy = 'startDate',
  sortDir = 'desc'
}) => {
  // Task Detail Panel State
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Use shared hook for all data and actions
  const {
    taskListItems,
    isLoading,
    error,
    actions,
    revalidate
  } = useMyTasksShared({
    page,
    size,
    sortBy,
    sortDir,
    searchValue
  });

  // Panel Actions
  const openTaskDetail = useCallback((task: TaskListItem) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  }, []);

  const closeTaskDetail = useCallback(() => {
    setIsPanelOpen(false);
    // Don't clear selectedTask immediately to avoid flicker
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  }, []);

  // Enhanced actions with panel integration
  const enhancedActions = {
    ...actions,
    
    onTaskEdit: useCallback(async (task: TaskListItem) => {
      await actions.onTaskEdit(task);
      // Update selected task if it's the one being edited
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask(task);
      }
      await revalidate();
    }, [actions, selectedTask, revalidate]),

    onTaskDelete: useCallback(async (taskId: string) => {
      await actions.onTaskDelete(taskId);
      // Close panel if the deleted task was selected
      if (selectedTask && selectedTask.id === taskId) {
        closeTaskDetail();
      }
      await revalidate();
    }, [actions, selectedTask, closeTaskDetail, revalidate]),

    onTaskStatusChange: useCallback(async (taskId: string, status: TaskStatus) => {
      await actions.onTaskStatusChange(taskId, status);
      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTask = { ...selectedTask, status };
        setSelectedTask(updatedTask);
      }
      await revalidate();
    }, [actions, selectedTask, revalidate]),

    onTaskAssign: useCallback(async (taskId: string, assigneeIdOrEmail: string) => {
      await actions.onTaskAssign(taskId, assigneeIdOrEmail);
      await revalidate();
    }, [actions, revalidate])
  };

  const contextValue: MyTasksContextType = {
    // Data
    taskListItems,
    isLoading,
    error,
    
    // Task Detail Panel State
    selectedTask,
    isPanelOpen,
    
    // Actions
    actions: enhancedActions,
    
    // Panel Actions
    openTaskDetail,
    closeTaskDetail,
    setSelectedTask,
    
    // Utility
    revalidate
  };

  return (
    <MyTasksContext.Provider value={contextValue}>
      {children}
    </MyTasksContext.Provider>
  );
};

export const useMyTasksContext = (): MyTasksContextType => {
  const context = useContext(MyTasksContext);
  if (context === undefined) {
    throw new Error('useMyTasksContext must be used within a MyTasksProvider');
  }
  return context;
};
