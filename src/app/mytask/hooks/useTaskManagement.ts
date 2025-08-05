import { useState, useMemo, useCallback } from "react";
import { TaskListItem, TaskStatus } from "@/components/TaskList";
import { groupTasksByAssignmentDate } from "@/components/TaskList/utils";

export interface TaskManagementState {
  tasks: TaskListItem[];
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TaskManagementActions {
  // Task CRUD operations
  addTask: (newTask: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<TaskListItem>) => void;
  deleteTask: (taskId: string) => void;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<TaskListItem>) => void;
  bulkDeleteTasks: (taskIds: string[]) => void;
  
  // Task selection and panel management
  openTaskPanel: (task: TaskListItem) => void;
  closeTaskPanel: () => void;
  setSelectedTask: (task: TaskListItem | null) => void;
  
  // Status management
  moveTaskToStatus: (taskId: string, newStatus: TaskStatus) => void;
  
  // Data management
  refreshTasks: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Enterprise-grade Task Management Hook
 * Provides centralized state management for tasks across all views (List, Board, Calendar)
 */
export const useTaskManagement = (initialTasks: TaskListItem[] = []): TaskManagementState & TaskManagementActions => {
  // Core State
  const [tasks, setTasks] = useState<TaskListItem[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Task CRUD Operations
  const addTask = useCallback((newTaskData: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: TaskListItem = {
      ...newTaskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Task added:', newTask);
    }
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<TaskListItem>) => {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updatesWithTimestamp } : task
      )
    );
    
    // Update selectedTask if it's the one being edited
    setSelectedTask(prev => 
      prev?.id === taskId ? { ...prev, ...updatesWithTimestamp } : prev
    );
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Task updated:', taskId, updatesWithTimestamp);
    }
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    // Close panel if deleted task was selected
    setSelectedTask(prev => prev?.id === taskId ? null : prev);
    setIsPanelOpen(prev => selectedTask?.id === taskId ? false : prev);
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Task deleted:', taskId);
    }
  }, [selectedTask?.id]);

  const bulkUpdateTasks = useCallback((taskIds: string[], updates: Partial<TaskListItem>) => {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    setTasks(prevTasks =>
      prevTasks.map(task =>
        taskIds.includes(task.id) ? { ...task, ...updatesWithTimestamp } : task
      )
    );
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Bulk update tasks:', taskIds, updatesWithTimestamp);
    }
  }, []);

  const bulkDeleteTasks = useCallback((taskIds: string[]) => {
    setTasks(prevTasks => prevTasks.filter(task => !taskIds.includes(task.id)));
    
    // Close panel if deleted task was selected
    if (selectedTask && taskIds.includes(selectedTask.id)) {
      setSelectedTask(null);
      setIsPanelOpen(false);
    }
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Bulk delete tasks:', taskIds);
    }
  }, [selectedTask]);

  // Task Selection and Panel Management
  const openTaskPanel = useCallback((task: TaskListItem) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  }, []);

  const closeTaskPanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedTask(null);
  }, []);

  // Status Management (for Board view)
  const moveTaskToStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  // Data Management
  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In real app, this would fetch from API
      // await fetchTasksFromAPI();
      
      // For now, we'll just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Tasks refreshed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh tasks';
      setError(errorMessage);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing tasks:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized computed values
  const tasksByStatus = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const status = task.status || 'todo';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<TaskStatus, TaskListItem[]>);
  }, [tasks]);

  // Group tasks by assignment date (for Board view)
  const tasksByAssignmentDate = useMemo(() => {
    const sections = groupTasksByAssignmentDate(tasks);
    const grouped: Record<string, TaskListItem[]> = {};
    
    sections.forEach(section => {
      grouped[section.id] = section.tasks;
    });
    
    return grouped;
  }, [tasks]);

  return {
    // State
    tasks,
    selectedTask,
    isPanelOpen,
    isLoading,
    error,
    
    // Actions
    addTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    openTaskPanel,
    closeTaskPanel,
    setSelectedTask,
    moveTaskToStatus,
    refreshTasks,
    setLoading: setIsLoading,
    setError,
    
    // Computed values (can be used by consuming components)
    tasksByStatus,
    tasksByAssignmentDate,
  } as TaskManagementState & TaskManagementActions & { 
    tasksByStatus: Record<TaskStatus, TaskListItem[]>;
    tasksByAssignmentDate: Record<string, TaskListItem[]>;
  };
};