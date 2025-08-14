"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskListItem, TaskStatus, TaskPriority, TaskAssignee } from '@/components/TaskList';
import { useProject } from '../../components/DynamicProjectProvider';

// SimpleCalendar Task interface (from Calendar component)
interface CalendarTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  assignee?: string;
  avatar?: string;
}

interface ProjectCalendarContextValue {
  // Original TaskListItem format for internal management
  tasks: TaskListItem[];
  // Converted format for SimpleCalendar
  calendarTasks: CalendarTask[];
  loading: boolean;
  error: string | null;
  
  // Task operations
  addTask: (task: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskListItem>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<TaskListItem>) => Promise<void>;
  
  // Calendar-specific handlers
  handleTaskClick: (task: CalendarTask) => void;
  handleTaskDrop: (task: CalendarTask, newDate: Date) => void;
  handleDateClick: (date: Date) => void;
  handleCreateTask: () => void;
  
  // Project context
  projectId: string;
  projectName: string;
}

const ProjectCalendarContext = createContext<ProjectCalendarContextValue | undefined>(undefined);

interface ProjectCalendarProviderProps {
  children: ReactNode;
}

// Helper function to convert TaskListItem to CalendarTask
const convertToCalendarTask = (task: TaskListItem): CalendarTask => {
  // Get primary assignee
  const primaryAssignee = task.assignees && task.assignees.length > 0 ? task.assignees[0] : null;
  
  // Color based on priority
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'urgent': return '#EF4444'; // Red
      case 'high': return '#F97316'; // Orange
      case 'medium': return '#3B82F6'; // Blue
      case 'low': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  // Convert dates
  const getTaskDate = (dateStr?: string): Date => {
    if (dateStr) {
      return new Date(dateStr);
    }
    return new Date(); // Default to today
  };

  const startDate = getTaskDate(task.startDate || task.dueDate);
  const endDate = getTaskDate(task.endDate || task.dueDate);

  return {
    id: task.id,
    title: task.name,
    startDate,
    endDate,
    color: getPriorityColor(task.priority),
    assignee: primaryAssignee?.name || 'Unassigned',
    avatar: primaryAssignee?.avatar || (primaryAssignee?.name ? primaryAssignee.name.substring(0, 2).toUpperCase() : 'UN')
  };
};

// Helper function to convert CalendarTask back to TaskListItem updates
const convertFromCalendarTask = (calendarTask: CalendarTask, originalTask: TaskListItem): Partial<TaskListItem> => {
  return {
    name: calendarTask.title,
    startDate: calendarTask.startDate.toISOString().split('T')[0],
    endDate: calendarTask.endDate.toISOString().split('T')[0],
    dueDate: calendarTask.endDate.toISOString().split('T')[0],
  };
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
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['testing', 'quality', 'automation'],
    project: projectName,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-4`,
    name: `Documentation Sprint for ${projectName}`,
    description: 'Write comprehensive documentation for the projects',
    status: 'in_progress' as TaskStatus,
    priority: 'low' as TaskPriority,
    assignees: [{ id: 'emma.davis', name: 'Emma Davis', avatar: 'ED' }],
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['documentation', 'writing'],
    project: projectName,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: `${projectId}-task-5`,
    name: `Performance Review for ${projectName}`,
    description: 'Optimize application performance and reduce load times',
    status: 'todo' as TaskStatus,
    priority: 'urgent' as TaskPriority,
    assignees: [{ id: 'alex.taylor', name: 'Alex Taylor', avatar: 'AT' }],
    startDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['performance', 'optimization', 'frontend'],
    project: projectName,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProjectCalendarProvider({ children }: ProjectCalendarProviderProps) {
  const { project, loading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert tasks to calendar format
  const calendarTasks = React.useMemo(() => {
    return tasks.map(convertToCalendarTask);
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

  // Calendar event handlers
  const handleTaskClick = (calendarTask: CalendarTask) => {
    console.log('Calendar task clicked:', calendarTask);
    // Could open task detail panel or modal here
  };

  const handleTaskDrop = async (calendarTask: CalendarTask, newDate: Date) => {
    const originalTask = tasks.find(t => t.id === calendarTask.id);
    if (originalTask) {
      const updates = convertFromCalendarTask(calendarTask, originalTask);
      await updateTask(calendarTask.id, updates);
    }
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // Could open create task modal for this date
  };

  const handleCreateTask = () => {
    console.log('Create task clicked');
    // Could open create task modal
  };

  const contextValue: ProjectCalendarContextValue = {
    tasks,
    calendarTasks,
    loading: loading || projectLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    handleTaskClick,
    handleTaskDrop,
    handleDateClick,
    handleCreateTask,
    projectId: project?.id || '',
    projectName: project?.name || '',
  };

  return (
    <ProjectCalendarContext.Provider value={contextValue}>
      {children}
    </ProjectCalendarContext.Provider>
  );
}

export function useProjectCalendar() {
  const context = useContext(ProjectCalendarContext);
  if (context === undefined) {
    throw new Error('useProjectCalendar must be used within a ProjectCalendarProvider');
  }
  return context;
}