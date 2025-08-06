"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskListItem, TaskStatus, TaskPriority, TaskAssignee } from '@/components/TaskList';
import { TimelineTask } from '@/components/Timeline';
import { useProject } from '../../components/DynamicProjectProvider';

interface ProjectTimelineContextValue {
  // Original TaskListItem format for internal management
  tasks: TaskListItem[];
  // Converted format for Timeline
  timelineTasks: TimelineTask[];
  loading: boolean;
  error: string | null;
  
  // View controls
  viewMode: 'week' | 'month' | 'quarter';
  setViewMode: (mode: 'week' | 'month' | 'quarter') => void;
  
  // Task operations
  addTask: (task: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskListItem>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<TaskListItem>) => Promise<void>;
  
  // Timeline-specific handlers
  handleTaskClick: (task: TimelineTask) => void;
  handleTaskUpdate: (taskId: string, updates: Partial<TimelineTask>) => void;
  
  // Project context
  projectId: string;
  projectName: string;
}

const ProjectTimelineContext = createContext<ProjectTimelineContextValue | undefined>(undefined);

interface ProjectTimelineProviderProps {
  children: ReactNode;
}

// Helper function to convert TaskListItem to TimelineTask
const convertToTimelineTask = (task: TaskListItem): TimelineTask => {
  // Get primary assignee
  const assignees = task.assignees?.map(assignee => ({
    id: assignee.id,
    name: assignee.name,
    avatar: assignee.avatar || assignee.name.substring(0, 2).toUpperCase()
  })) || [];

  // Convert dates
  const getTaskDate = (dateStr?: string): Date => {
    if (dateStr) {
      return new Date(dateStr);
    }
    return new Date(); // Default to today
  };

  const startDate = getTaskDate(task.startDate || task.dueDate);
  const endDate = getTaskDate(task.endDate || task.dueDate);

  // Calculate progress based on status
  const getProgress = (status: TaskStatus): number => {
    switch (status) {
      case 'done': return 100;
      case 'review': return 90;
      case 'in_progress': return 50;
      case 'todo': return 0;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  return {
    id: task.id,
    title: task.name,
    startDate,
    endDate,
    progress: getProgress(task.status),
    priority: task.priority,
    status: task.status,
    assignees,
    milestone: task.tags?.includes('milestone') || false,
    dependencies: [] // Could be enhanced later
  };
};

// Helper function to convert TimelineTask back to TaskListItem updates
const convertFromTimelineTask = (timelineTask: TimelineTask, originalTask: TaskListItem): Partial<TaskListItem> => {
  return {
    name: timelineTask.title,
    startDate: timelineTask.startDate.toISOString().split('T')[0],
    endDate: timelineTask.endDate.toISOString().split('T')[0],
    dueDate: timelineTask.endDate.toISOString().split('T')[0],
  };
};

// Mock tasks data - in real app, this would come from API based on projectId
const generateMockTasks = (projectId: string, projectName: string): TaskListItem[] => [
  {
    id: `${projectId}-task-1`,
    name: `Design System Setup for ${projectName}`,
    description: 'Create comprehensive design system and component library',
    status: 'in_progress' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'sarah.wilson', name: 'Sarah Wilson', avatar: 'SW' }],
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['design', 'frontend', 'milestone'],
    project: projectName,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-2`,
    name: `API Development for ${projectName}`,
    description: 'Build RESTful APIs and database integration',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [
      { id: 'john.doe', name: 'John Doe', avatar: 'JD' },
      { id: 'mike.chen', name: 'Mike Chen', avatar: 'MC' }
    ],
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['backend', 'api', 'database'],
    project: projectName,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-3`,
    name: `Frontend Implementation for ${projectName}`,
    description: 'Build user interface components and pages',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignees: [{ id: 'emma.davis', name: 'Emma Davis', avatar: 'ED' }],
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['frontend', 'ui', 'react'],
    project: projectName,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-4`,
    name: `Testing & QA for ${projectName}`,
    description: 'Comprehensive testing and quality assurance',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignees: [{ id: 'alex.taylor', name: 'Alex Taylor', avatar: 'AT' }],
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['testing', 'qa', 'automation'],
    project: projectName,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-5`,
    name: `Deployment & Launch for ${projectName}`,
    description: 'Production deployment and go-live activities',
    status: 'todo' as TaskStatus,
    priority: 'urgent' as TaskPriority,
    assignees: [
      { id: 'lisa.park', name: 'Lisa Park', avatar: 'LP' },
      { id: 'john.doe', name: 'John Doe', avatar: 'JD' }
    ],
    startDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['deployment', 'production', 'milestone'],
    project: projectName,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProjectTimelineProvider({ children }: ProjectTimelineProviderProps) {
  const { project, loading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month');

  // Convert tasks to timeline format
  const timelineTasks = React.useMemo(() => {
    return tasks.map(convertToTimelineTask);
  }, [tasks]);

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

  // Timeline event handlers
  const handleTaskClick = (timelineTask: TimelineTask) => {
    console.log('Timeline task clicked:', timelineTask);
    // Could open task detail panel or modal here
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<TimelineTask>) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (originalTask) {
      // Convert timeline updates back to TaskListItem format
      const taskUpdates: Partial<TaskListItem> = {};
      
      if (updates.title) taskUpdates.name = updates.title;
      if (updates.startDate) taskUpdates.startDate = updates.startDate.toISOString().split('T')[0];
      if (updates.endDate) {
        taskUpdates.endDate = updates.endDate.toISOString().split('T')[0];
        taskUpdates.dueDate = updates.endDate.toISOString().split('T')[0];
      }
      if (updates.priority) taskUpdates.priority = updates.priority;
      if (updates.status) taskUpdates.status = updates.status;
      
      await updateTask(taskId, taskUpdates);
    }
  };

  const contextValue: ProjectTimelineContextValue = {
    tasks,
    timelineTasks,
    loading: loading || projectLoading,
    error,
    viewMode,
    setViewMode,
    addTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    handleTaskClick,
    handleTaskUpdate,
    projectId: project?.id || '',
    projectName: project?.name || '',
  };

  return (
    <ProjectTimelineContext.Provider value={contextValue}>
      {children}
    </ProjectTimelineContext.Provider>
  );
}

export function useProjectTimeline() {
  const context = useContext(ProjectTimelineContext);
  if (context === undefined) {
    throw new Error('useProjectTimeline must be used within a ProjectTimelineProvider');
  }
  return context;
}