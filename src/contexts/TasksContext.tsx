"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

// Task Data Models - Centralized
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

// Context Interface - Senior Product Code
interface TasksContextType {
  // Data
  tasks: Task[];
  assignedTasks: AssignedTask[];
  goals: Goal[];
  
  // State
  isLoading: boolean;
  error: string | null;
  taskStates: Record<number, boolean>; // Completion states
  
  // Actions - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskComplete: (taskId: number) => void;
  
  // Actions - Assigned Tasks
  assignTask: (task: Omit<AssignedTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAssignedTask: (id: number, updates: Partial<AssignedTask>) => Promise<void>;
  
  // Actions - Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: number, updates: Partial<Goal>) => Promise<void>;
  updateGoalProgress: (id: number, progress: number) => Promise<void>;
  
  // General Actions
  refreshTasks: () => Promise<void>;
  
  // Computed
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    dueToday: number;
    byPriority: Record<Task['priority'], number>;
    byStatus: Record<Task['status'], number>;
  };
  
  goalStats: {
    total: number;
    onTrack: number;
    atRisk: number;
    offTrack: number;
    completed: number;
    averageProgress: number;
  };
}

// Create Context
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Initial Data - Professional Mock Data
const INITIAL_TASKS: Task[] = [
  { 
    id: 1, 
    title: "Complete project proposal", 
    description: "Finalize Q1 project proposal document",
    dueDate: "Today", 
    dueDateISO: new Date(),
    completed: false, 
    priority: 'high',
    status: 'pending',
    hasTag: false,
    projectId: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  { 
    id: 2, 
    title: "Review design mockups", 
    description: "Review and provide feedback on new design mockups",
    dueDate: "Today", 
    dueDateISO: new Date(),
    completed: false, 
    priority: 'medium',
    status: 'pending',
    hasTag: false,
    projectId: 1,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  { 
    id: 3, 
    title: "Update project documentation", 
    description: "Update technical documentation for the project",
    dueDate: "Tomorrow", 
    dueDateISO: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false, 
    priority: 'low',
    status: 'pending',
    hasTag: false,
    projectId: 2,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  { 
    id: 4, 
    title: "Remember to add discussion topics for the next meeting", 
    description: "Prepare agenda items for team meeting",
    dueDate: "Tomorrow", 
    dueDateISO: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false, 
    priority: 'medium',
    status: 'pending',
    hasTag: true,
    tagText: "cuon...",
    projectId: 8,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  { 
    id: 5, 
    title: "Prepare presentation slides", 
    description: "Create slides for client presentation",
    dueDate: "Thursday", 
    dueDateISO: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    completed: false, 
    priority: 'high',
    status: 'pending',
    hasTag: false,
    projectId: 3,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  { 
    id: 6, 
    title: "Code review for new feature", 
    description: "Review pull requests for the new dashboard feature",
    dueDate: "Thursday", 
    dueDateISO: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    completed: false, 
    priority: 'medium',
    status: 'pending',
    hasTag: false,
    projectId: 2,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
];

const INITIAL_ASSIGNED_TASKS: AssignedTask[] = [
  { 
    id: 101, 
    title: "Remember to add discussion topics for the next meeting", 
    description: "Prepare meeting agenda and discussion points",
    dueDate: "Today", 
    dueDateISO: new Date(),
    completed: false, 
    priority: 'high',
    status: 'pending',
    hasTag: true,
    tagText: "cuon...",
    assignee: { id: "user-1", name: "John Doe", avatar: "👤", color: "#ef4444" },
    projectId: 8,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  { 
    id: 102, 
    title: "Review project proposal", 
    description: "Review and approve the Q1 project proposal",
    dueDate: "Tomorrow", 
    dueDateISO: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false, 
    priority: 'medium',
    status: 'pending',
    hasTag: false,
    assignee: { id: "user-2", name: "Jane Smith", avatar: "👤", color: "#3b82f6" },
    projectId: 1,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  { 
    id: 103, 
    title: "Update technical documentation", 
    description: "Update API documentation and user guides",
    dueDate: "Friday", 
    dueDateISO: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    completed: false, 
    priority: 'low',
    status: 'pending',
    hasTag: false,
    assignee: { id: "user-3", name: "Bob Wilson", avatar: "👤", color: "#10b981" },
    projectId: 2,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
];

const INITIAL_GOALS: Goal[] = [
  { 
    id: 1, 
    name: "Complete Q1 Development Objectives", 
    description: "Finish all planned development tasks for Q1",
    progress: 65, 
    period: "Q1 FY25 • Development Team", 
    status: 'on-track',
    targetDate: new Date('2024-03-31'),
    ownerId: 'current-user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20')
  },
  { 
    id: 2, 
    name: "Launch new product feature", 
    description: "Successfully launch the new dashboard feature",
    progress: 30, 
    period: "Q1 FY25 • Product Team", 
    status: 'at-risk',
    targetDate: new Date('2024-02-28'),
    ownerId: 'current-user',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19')
  },
  { 
    id: 3, 
    name: "Improve team productivity metrics", 
    description: "Increase team productivity by 25%",
    progress: 0, 
    period: "Q2 FY25 • My workspace", 
    status: 'on-track',
    targetDate: new Date('2024-06-30'),
    ownerId: 'current-user',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
];

// Provider Props
interface TasksProviderProps {
  children: ReactNode;
}

// Professional Tasks Provider - Senior Product Implementation
export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  // State Management
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(INITIAL_ASSIGNED_TASKS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskStates, setTaskStates] = useState<Record<number, boolean>>({});

  // Computed Values - Memoized for Performance
  const taskStats = useMemo(() => {
    const today = new Date().toDateString();
    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Task['priority'], number>);

    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);

    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => t.dueDateISO && t.dueDateISO < new Date() && !t.completed).length,
      dueToday: tasks.filter(t => t.dueDateISO?.toDateString() === today).length,
      byPriority,
      byStatus,
    };
  }, [tasks]);

  const goalStats = useMemo(() => {
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    
    return {
      total: goals.length,
      onTrack: goals.filter(g => g.status === 'on-track').length,
      atRisk: goals.filter(g => g.status === 'at-risk').length,
      offTrack: goals.filter(g => g.status === 'off-track').length,
      completed: goals.filter(g => g.status === 'completed').length,
      averageProgress: goals.length > 0 ? Math.round(totalProgress / goals.length) : 0,
    };
  }, [goals]);

  // Task Actions
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTask: Task = {
        ...taskData,
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    console.log('🔄 TasksContext.updateTask called:', { id, updates });
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTasks(prev => {
        const updated = prev.map(task => 
          task.id === id 
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        );
        
        const beforeTask = prev.find(t => t.id === id);
        const afterTask = updated.find(t => t.id === id);
        
        console.log('📝 TasksContext.updateTask - tasks updated:', {
          taskId: id,
          before: { id: beforeTask?.id, title: beforeTask?.title, completed: beforeTask?.completed, status: beforeTask?.status },
          after: { id: afterTask?.id, title: afterTask?.title, completed: afterTask?.completed, status: afterTask?.status },
          totalTasks: updated.length,
          completedTasks: updated.filter(t => t.completed || t.status === 'completed').length
        });
        
        return updated;
      });
      
      console.log('✅ TasksContext.updateTask completed successfully');
    } catch (err) {
      console.error('❌ TasksContext.updateTask failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTaskComplete = useCallback((taskId: number) => {
    setTaskStates(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    // Also update the actual task with both completed and status
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        return { 
          ...task, 
          completed: newCompleted,
          status: newCompleted ? 'completed' : 'pending',
          updatedAt: new Date() 
        };
      }
      return task;
    }));
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 toggleTaskComplete:', taskId);
    }
  }, []);

  // Assigned Task Actions
  const assignTask = useCallback(async (taskData: Omit<AssignedTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTask: AssignedTask = {
        ...taskData,
        id: Math.max(...assignedTasks.map(t => t.id), 100) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setAssignedTasks(prev => [newTask, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    } finally {
      setIsLoading(false);
    }
  }, [assignedTasks]);

  const updateAssignedTask = useCallback(async (id: number, updates: Partial<AssignedTask>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAssignedTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assigned task');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Goal Actions
  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newGoal: Goal = {
        ...goalData,
        id: Math.max(...goals.map(g => g.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setGoals(prev => [newGoal, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add goal');
    } finally {
      setIsLoading(false);
    }
  }, [goals]);

  const updateGoal = useCallback(async (id: number, updates: Partial<Goal>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setGoals(prev => prev.map(goal => 
        goal.id === id 
          ? { ...goal, ...updates, updatedAt: new Date() }
          : goal
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGoalProgress = useCallback(async (id: number, progress: number) => {
    await updateGoal(id, { progress });
  }, [updateGoal]);

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch from API
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Context Value - Memoized to Prevent Unnecessary Re-renders
  const contextValue = useMemo(() => ({
    // Data
    tasks,
    assignedTasks,
    goals,
    
    // State
    isLoading,
    error,
    taskStates,
    
    // Actions - Tasks
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    
    // Actions - Assigned Tasks
    assignTask,
    updateAssignedTask,
    
    // Actions - Goals
    addGoal,
    updateGoal,
    updateGoalProgress,
    
    // General Actions
    refreshTasks,
    
    // Computed
    taskStats,
    goalStats,
  }), [
    tasks,
    assignedTasks,
    goals,
    isLoading,
    error,
    taskStates,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    assignTask,
    updateAssignedTask,
    addGoal,
    updateGoal,
    updateGoalProgress,
    refreshTasks,
    taskStats,
    goalStats,
  ]);

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};

// Custom Hook - Professional Implementation
export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

// Export types for external use
export type { TasksContextType };