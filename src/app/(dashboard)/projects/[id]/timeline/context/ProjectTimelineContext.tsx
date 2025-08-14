"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskListItem, TaskStatus, TaskPriority, TaskAssignee } from '@/components/TaskList';
import { GanttTask } from '@/components/TimelineGantt';
import { useProject } from '../../components/DynamicProjectProvider';

interface ProjectTimelineContextValue {
  // Original TaskListItem format for internal management
  tasks: TaskListItem[];
  // Converted format for Gantt timeline
  ganttTasks: GanttTask[];
  // Grouped by sections for Gantt
  tasksBySection: Record<string, GanttTask[]>;
  loading: boolean;
  error: string | null;
  
  // Task operations
  addTask: (task: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<TaskListItem>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, sectionId: string) => Promise<void>;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<TaskListItem>) => Promise<void>;
  
  // Timeline-specific handlers
  handleTaskClick: (task: GanttTask) => void;
  handleTaskMove: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  handleSectionToggle: (sectionId: string) => void;
  handleAddSection: () => void;
  
  // Project context
  projectId: string;
  projectName: string;
}

const ProjectTimelineContext = createContext<ProjectTimelineContextValue | undefined>(undefined);

interface ProjectTimelineProviderProps {
  children: ReactNode;
}

// Helper function to convert TaskListItem to GanttTask
const convertToGanttTask = (task: TaskListItem): GanttTask => {
  // Get assignees
  const assignees = task.assignees?.map(assignee => ({
    id: assignee.id,
    name: assignee.name,
    avatar: assignee.avatar || assignee.name.substring(0, 2).toUpperCase()
  })) || [];

  // Convert dates - use proper timeline dates
  const getTaskDate = (dateStr?: string): Date => {
    if (dateStr) {
      return new Date(dateStr);
    }
    return new Date(2025, 6, 28); // Default to July 28, 2025
  };

  const startDate = getTaskDate(task.startDate || task.dueDate);
  const endDate = getTaskDate(task.endDate || task.dueDate);

  // Determine section based on status
  let section = 'todo';
  if (task.status === 'in_progress') section = 'in_progress';
  else if (task.status === 'done' || task.status === 'review') section = 'done';
  else if (!task.dueDate) section = 'later';

  return {
    id: task.id,
    title: task.name,
    startDate,
    endDate,
    priority: task.priority,
    status: task.status,
    assignees,
    section
  };
};

// Helper function to group Gantt tasks by section
const groupTasksBySection = (ganttTasks: GanttTask[]): Record<string, GanttTask[]> => {
  const groups: Record<string, GanttTask[]> = {
    'todo': [],
    'in_progress': [],
    'done': [],
    'later': []
  };

  ganttTasks.forEach(task => {
    if (groups[task.section]) {
      groups[task.section].push(task);
    } else {
      groups['todo'].push(task);
    }
  });

  return groups;
};

// Mock tasks data - in real app, this would come from API based on projectId
const generateMockTasks = (projectId: string, projectName: string): TaskListItem[] => [
  {
    id: `${projectId}-task-1`,
    name: `Schedule kickoff`,
    description: 'Initial projects kickoff meeting with stakeholders',
    status: 'in_progress' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'vl', name: 'VL', avatar: 'VL' }],
    startDate: '2025-08-05', // W32: 4-10
    endDate: '2025-08-08',
    dueDate: '2025-08-08',
    tags: ['kickoff', 'meeting'],
    project: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${projectId}-task-2`,
    name: `Share timeline with`,
    description: 'Share projects timeline with team members',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignees: [{ id: 'team', name: 'Team', avatar: 'T' }],
    startDate: '2025-08-12', // W33: 11-17
    endDate: '2025-08-16',
    dueDate: '2025-08-16',
    tags: ['timeline', 'communication'],
    project: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${projectId}-task-3`,
    name: `Frontend Development Phase`,
    description: 'Build user interface components and pages',
    status: 'done' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'dev1', name: 'Developer 1', avatar: 'D1' }],
    startDate: '2025-07-15',
    endDate: '2025-07-25',
    dueDate: '2025-07-25',
    tags: ['frontend', 'development'],
    project: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${projectId}-task-4`,
    name: `Backend API Integration`,
    description: 'Integrate backend APIs with frontend',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    assignees: [{ id: 'be1', name: 'Backend Dev', avatar: 'BE' }],
    startDate: '2025-09-02', // W36: 1-7
    endDate: '2025-09-05',
    dueDate: '2025-09-05',
    tags: ['backend', 'api'],
    project: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `${projectId}-task-5`,
    name: `Testing & Quality Assurance`,
    description: 'Comprehensive testing of all features',
    status: 'later' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignees: [{ id: 'qa1', name: 'QA Tester', avatar: 'QA' }],
    startDate: '2025-09-10',
    endDate: '2025-09-20',
    dueDate: '2025-09-20',
    tags: ['testing', 'qa'],
    project: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function ProjectTimelineProvider({ children }: ProjectTimelineProviderProps) {
  const { project, loading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Convert tasks to gantt format
  const ganttTasks = React.useMemo(() => {
    return tasks.map(convertToGanttTask);
  }, [tasks]);

  // Group gantt tasks by section
  const tasksBySection = React.useMemo(() => {
    return groupTasksBySection(ganttTasks);
  }, [ganttTasks]);

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

  const moveTask = async (taskId: string, sectionId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Calculate new due date based on section (same logic as board)
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

  // Gantt timeline event handlers
  const handleTaskClick = (task: GanttTask) => {
    console.log('Gantt task clicked:', task);
    // Could open task detail panel or modal here
  };

  const handleTaskMove = async (taskId: string, newStartDate: Date, newEndDate: Date) => {
    const startDateStr = newStartDate.toISOString().split('T')[0];
    const endDateStr = newEndDate.toISOString().split('T')[0];
    
    await updateTask(taskId, { 
      startDate: startDateStr,
      endDate: endDateStr,
      dueDate: endDateStr
    });
  };

  const handleSectionToggle = (sectionId: string) => {
    console.log('Section toggle:', sectionId);
    // Could implement section collapse/expand state
  };

  const handleAddSection = () => {
    console.log('Add section clicked');
    // Could open add section modal
  };

  const contextValue: ProjectTimelineContextValue = {
    tasks,
    ganttTasks,
    tasksBySection,
    loading: loading || projectLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    bulkUpdateTasks,
    handleTaskClick,
    handleTaskMove,
    handleSectionToggle,
    handleAddSection,
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