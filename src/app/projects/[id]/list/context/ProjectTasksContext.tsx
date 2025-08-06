"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskListItem, TaskStatus, TaskPriority, TaskAssignee } from '@/components/TaskList';
import { useProject } from '../../components/DynamicProjectProvider';

interface ProjectTasksContextValue {
  tasks: TaskListItem[];
  loading: boolean;
  error: string | null;
  
  // Task operations
  addTask: (task: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskListItem>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<TaskListItem>) => Promise<void>;
  
  // Task selection and panel
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
  openTaskPanel: (task: TaskListItem) => void;
  closeTaskPanel: () => void;
  setSelectedTask: (task: TaskListItem | null) => void;
  
  // Project context
  projectId: string;
  projectName: string;
}

const ProjectTasksContext = createContext<ProjectTasksContextValue | undefined>(undefined);

interface ProjectTasksProviderProps {
  children: ReactNode;
}

// Mock tasks data - in real app, this would come from API based on projectId
const generateMockTasks = (projectId: string, projectName: string): TaskListItem[] => [
  {
    id: `${projectId}-task-1`,
    name: `Design System Components for ${projectName}`,
    description: 'Create reusable UI components following design system guidelines',
    status: 'in_progress' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'sarah.wilson', name: 'Sarah Wilson', avatar: 'SW' }],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['design', 'frontend', 'ui'],
    project: projectName,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-2`,
    name: `API Integration for ${projectName}`,
    description: 'Integrate backend APIs with frontend components',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignees: [{ id: 'john.doe', name: 'John Doe', avatar: 'JD' }],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['backend', 'integration', 'api'],
    project: projectName,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-3`,
    name: `Testing Suite for ${projectName}`,
    description: 'Set up comprehensive testing framework and write unit tests',
    status: 'done' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'mike.chen', name: 'Mike Chen', avatar: 'MC' }],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['testing', 'quality', 'automation'],
    project: projectName,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-4`,
    name: `Documentation for ${projectName}`,
    description: 'Write comprehensive documentation for the project',
    status: 'in_progress' as TaskStatus,
    priority: 'low' as TaskPriority,
    assignees: [{ id: 'emma.davis', name: 'Emma Davis', avatar: 'ED' }],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['documentation', 'writing'],
    project: projectName,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-5`,
    name: `Performance Optimization for ${projectName}`,
    description: 'Optimize application performance and reduce load times',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignees: [{ id: 'alex.taylor', name: 'Alex Taylor', avatar: 'AT' }],
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['performance', 'optimization', 'frontend'],
    project: projectName,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProjectTasksProvider({ children }: ProjectTasksProviderProps) {
  const { project, loading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load tasks when project changes
  useEffect(() => {
    const loadProjectTasks = async () => {
      if (!project) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In real app, this would be an API call
        // const response = await fetch(`/api/projects/${project.id}/tasks`);
        // const projectTasks = await response.json();
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const mockTasks = generateMockTasks(project.id, project.name);
        setTasks(mockTasks);
        
      } catch (err) {
        setError('Failed to load project tasks');
        console.error('Error loading project tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectTasks();
  }, [project]);

  // Task operations
  const addTask = async (taskData: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!project) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTask: TaskListItem = {
        ...taskData,
        id: `${project.id}-task-${Date.now()}`,
        project: project.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTasks(prev => [newTask, ...prev]);
      
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TaskListItem>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              ...updates, 
              updatedAt: new Date().toISOString()
            }
          : task
      ));
      
      // Update selected task if it's the one being updated
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
      }
      
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Close panel if deleted task was selected
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
        setIsPanelOpen(false);
      }
      
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateTasks = async (taskIds: string[], updates: Partial<TaskListItem>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.id) 
          ? { 
              ...task, 
              ...updates, 
              updatedAt: new Date().toISOString()
            }
          : task
      ));
      
    } catch (err) {
      setError('Failed to bulk update tasks');
      console.error('Error bulk updating tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Panel operations
  const openTaskPanel = (task: TaskListItem) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const closeTaskPanel = () => {
    setIsPanelOpen(false);
    // Don't clear selectedTask immediately to allow smooth closing animation
    setTimeout(() => setSelectedTask(null), 300);
  };

  const contextValue: ProjectTasksContextValue = {
    tasks,
    loading: loading || projectLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    selectedTask,
    isPanelOpen,
    openTaskPanel,
    closeTaskPanel,
    setSelectedTask,
    projectId: project?.id || '',
    projectName: project?.name || '',
  };

  return (
    <ProjectTasksContext.Provider value={contextValue}>
      {children}
    </ProjectTasksContext.Provider>
  );
}

export function useProjectTasks() {
  const context = useContext(ProjectTasksContext);
  if (context === undefined) {
    throw new Error('useProjectTasks must be used within a ProjectTasksProvider');
  }
  return context;
}