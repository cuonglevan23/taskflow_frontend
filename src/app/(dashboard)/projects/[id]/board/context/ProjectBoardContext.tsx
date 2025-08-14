"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskListItem, TaskStatus, TaskPriority, TaskAssignee } from '@/components/TaskList';
import { useProject } from '../../components/DynamicProjectProvider';

interface ProjectBoardContextValue {
  tasks: TaskListItem[];
  tasksByAssignmentDate: Record<string, TaskListItem[]>;
  loading: boolean;
  error: string | null;
  
  // Task operations
  addTask: (task: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskListItem>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, sectionId: string) => Promise<void>;
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

const ProjectBoardContext = createContext<ProjectBoardContextValue | undefined>(undefined);

interface ProjectBoardProviderProps {
  children: ReactNode;
}

// Helper function to group tasks by assignment date
const groupTasksByAssignmentDate = (tasks: TaskListItem[]): Record<string, TaskListItem[]> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const groups: Record<string, TaskListItem[]> = {
    'recently-assigned': [],
    'do-today': [],
    'do-next-week': [],
    'do-later': []
  };

  tasks.forEach(task => {
    if (!task.dueDate) {
      groups['recently-assigned'].push(task);
      return;
    }

    const dueDate = new Date(task.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
      groups['do-today'].push(task);
    } else if (daysDiff <= 7) {
      groups['do-next-week'].push(task);
    } else {
      groups['do-later'].push(task);
    }
  });

  return groups;
};

// Mock tasks data - in real app, this would come from API based on projectId
const generateMockTasks = (projectId: string, projectName: string): TaskListItem[] => [
  {
    id: `${projectId}-task-1`,
    name: `Design System Components for ${projectName}`,
    description: 'Create reusable UI components following design system guidelines',
    status: 'in_progress' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'sarah.wilson', name: 'Sarah Wilson', avatar: 'SW' }],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Today
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
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
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
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday (completed)
    tags: ['testing', 'quality', 'automation'],
    project: projectName,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-4`,
    name: `Documentation for ${projectName}`,
    description: 'Write comprehensive documentation for the projects',
    status: 'in_progress' as TaskStatus,
    priority: 'low' as TaskPriority,
    assignees: [{ id: 'emma.davis', name: 'Emma Davis', avatar: 'ED' }],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Later
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
    tags: ['performance', 'optimization', 'frontend'],
    project: projectName,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-6`,
    name: `Security Audit for ${projectName}`,
    description: 'Conduct comprehensive security review and implement fixes',
    status: 'todo' as TaskStatus,
    priority: 'urgent' as TaskPriority,
    assignees: [{ id: 'lisa.park', name: 'Lisa Park', avatar: 'LP' }],
    dueDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Today
    tags: ['security', 'audit', 'urgent'],
    project: projectName,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProjectBoardProvider({ children }: ProjectBoardProviderProps) {
  const { project, loading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Compute grouped tasks
  const tasksByAssignmentDate = React.useMemo(() => {
    return groupTasksByAssignmentDate(tasks);
  }, [tasks]);

  // Load tasks when projects changes
  useEffect(() => {
    const loadProjectTasks = async () => {
      if (!project) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In real app, this would be an API call
        // const response = await fetch(`/api/projects/${projects.id}/tasks`);
        // const projectTasks = await response.json();
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const mockTasks = generateMockTasks(project.id, project.name);
        setTasks(mockTasks);
        
      } catch (err) {
        setError('Failed to load projects tasks');
        console.error('Error loading projects tasks:', err);
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

  const moveTask = async (taskId: string, sectionId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Calculate new due date based on section
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const later = new Date(today);
      later.setDate(today.getDate() + 14);

      let newDueDate: string | undefined;
      
      switch (sectionId) {
        case 'do-today':
          newDueDate = today.toISOString().split('T')[0];
          break;
        case 'do-next-week':
          newDueDate = nextWeek.toISOString().split('T')[0];
          break;
        case 'do-later':
          newDueDate = later.toISOString().split('T')[0];
          break;
        case 'recently-assigned':
          newDueDate = undefined; // Remove due date
          break;
      }

      // Update task with new due date
      await updateTask(taskId, { dueDate: newDueDate });
      
    } catch (err) {
      setError('Failed to move task');
      console.error('Error moving task:', err);
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

  const contextValue: ProjectBoardContextValue = {
    tasks,
    tasksByAssignmentDate,
    loading: loading || projectLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
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
    <ProjectBoardContext.Provider value={contextValue}>
      {children}
    </ProjectBoardContext.Provider>
  );
}

export function useProjectBoard() {
  const context = useContext(ProjectBoardContext);
  if (context === undefined) {
    throw new Error('useProjectBoard must be used within a ProjectBoardProvider');
  }
  return context;
}