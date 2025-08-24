"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { FullCalendarView } from './';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { TaskListItem, TaskAssignee } from '@/components/TaskList/types';
import { useTheme } from '@/layouts/hooks/useTheme';

// Project-specific calendar types (no my-tasks dependency)
export interface ProjectCalendarProps {
  // Data props - will be provided by project context/hooks
  tasks?: any[]; // Project tasks in any format
  projectId?: string;
  projectName?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  height?: string;
  
  // Project-specific event handlers (no my-tasks data dependency)
  onEventClick?: (task: any) => void;
  onDateClick?: (dateStr: string) => void;
  onEventDrop?: (taskId: string, newDateStr: string) => void;
  onEventResize?: (taskId: string, newStartDate: string, newEndDate: string) => void;
  onTaskSave?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    projectId?: string;
  }) => void;
}

interface ProjectCalendarState {
  currentDate: Date;
  view: 'dayGridMonth' | 'dayGridWeek';
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
}

const ProjectCalendar: React.FC<ProjectCalendarProps> = ({
  tasks = [],
  projectId,
  projectName,
  loading = false,
  error,
  className = '',
  height = 'calc(100vh - 80px)',
  
  // Project-specific handlers
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  onTaskSave,
  onTaskDelete,
  onTaskCreate,
}) => {
  const { theme } = useTheme();
  
  // Calendar state (inherited from my-tasks interface)
  const [calendarState, setCalendarState] = useState<ProjectCalendarState>({
    currentDate: new Date(),
    view: 'dayGridMonth',
    selectedTask: null,
    isPanelOpen: false
  });

  // Convert API tasks to FullCalendar format (task domain types)
  const calendarTasks = useMemo(() => {
    console.log('🔍 ProjectCalendar: Processing tasks for calendar:', tasks);
    
    return tasks?.map(task => {
      // Ensure all date fields are properly processed
      const processedTask = {
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        endDate: task.deadline || task.endDate, // Prioritize deadline over endDate
        deadline: task.deadline,
        assigneeId: task.assigneeId,
        description: task.description,
        status: task.status,
        priority: task.priority,
        completed: task.completed,
        projectId,
        color: task.color,
      };
      
      console.log('📅 ProjectCalendar task:', {
        id: processedTask.id,
        title: processedTask.title,
        startDate: processedTask.startDate,
        endDate: processedTask.endDate,
        deadline: processedTask.deadline
      });
      
      return processedTask;
    }) || [];
  }, [tasks, projectId]);

  // Convert single task to TaskListItem format for detail panel
  const convertToTaskListItem = useCallback((task: any): TaskListItem => {
    console.log('🔍 Converting task for detail panel:', task);
    
    // Create assignee object if needed
    const assignees = task.assignees || [];
    if (task.assigneeName || task.assignee) {
      // Add assignee from assigneeName or assignee property if not in assignees array
      const assigneeName = task.assigneeName || task.assignee || '';
      if (assigneeName && !assignees.some((a: TaskAssignee) => a.name === assigneeName)) {
        assignees.push({
          id: 'temp-' + Date.now(),
          name: assigneeName
        });
      }
    }
    
    return {
      id: task.id?.toString() || '',
      name: task.title || task.name || '',
      description: task.description || '',
      assignees: assignees,
      assignedEmails: task.assignedEmails || [],
      dueDate: task.deadline || task.dueDate, // Use deadline as primary date field
      deadline: task.deadline, // Keep original deadline
      startDate: task.startDate, // Keep original startDate
      endDate: task.endDate || task.deadline, // Use deadline as fallback for endDate
      priority: task.priority || 'MEDIUM',
      status: task.status || 'TODO',
      tags: task.tags || [],
      project: projectName,
      projectName: projectName, // Include projectName explicitly for detail panel
      projectId: projectId ? Number(projectId) : undefined, // Include projectId as number for linking
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      completed: task.completed || task.status === 'DONE',
    };
  }, [projectName, projectId]);

  // Calendar navigation handlers (inherited interface)
  const handlePrevious = useCallback(() => {
    const newDate = new Date(calendarState.currentDate);
    if (calendarState.view === 'dayGridMonth') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCalendarState(prev => ({ ...prev, currentDate: newDate }));
  }, [calendarState.currentDate, calendarState.view]);

  const handleNext = useCallback(() => {
    const newDate = new Date(calendarState.currentDate);
    if (calendarState.view === 'dayGridMonth') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCalendarState(prev => ({ ...prev, currentDate: newDate }));
  }, [calendarState.currentDate, calendarState.view]);

  const handleToday = useCallback(() => {
    setCalendarState(prev => ({ ...prev, currentDate: new Date() }));
  }, []);

  // Task event handlers (inherited interface, project-specific logic)
  const handleEventClick = useCallback((task: any) => {
    const taskListItem = convertToTaskListItem(task);
    setCalendarState(prev => ({ 
      ...prev, 
      selectedTask: taskListItem, 
      isPanelOpen: true 
    }));
    onEventClick?.(task);
  }, [convertToTaskListItem, onEventClick]);

  const handleDateClick = useCallback(async (dateStr: string) => {
    try {
      // Create default task for project
      const taskData = {
        name: `New Task - ${dateStr}`,
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: dateStr,
        deadline: dateStr,
        projectId,
      };
      
      // Use onDateClick handler if provided, otherwise fallback to onTaskCreate
      if (onDateClick) {
        await onDateClick(dateStr);
      } else if (onTaskCreate) {
        await onTaskCreate(taskData);
      }

    } catch (error) {
      console.error('❌ Project Calendar: Failed to create task:', error);
    }
  }, [projectId, onDateClick, onTaskCreate]);

  const handleEventDrop = useCallback(async (taskId: string, newDateStr: string) => {
    try {
      await onEventDrop?.(taskId, newDateStr);

    } catch (error) {
      console.error('❌ Project Calendar: Failed to move task:', error);
    }
  }, [onEventDrop]);

  const handleEventResize = useCallback(async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      await onEventResize?.(taskId, newStartDate, newEndDate);

    } catch (error) {
      console.error('❌ Project Calendar: Failed to resize task:', error);
    }
  }, [onEventResize]);

  // Task detail panel handlers (inherited interface)
  const handleTaskSave = useCallback(async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      await onTaskSave?.(taskId, updates);
      setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));

    } catch (error) {
      console.error('❌ Project Calendar: Failed to save task:', error);
    }
  }, [onTaskSave]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await onTaskDelete?.(taskId);
      setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));

    } catch (error) {
      console.error('❌ Project Calendar: Failed to delete task:', error);
    }
  }, [onTaskDelete]);

  const handleClosePanel = useCallback(() => {
    setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, []);

  // Loading state (inherited interface)
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: theme.text.secondary }}>Loading project calendar...</p>
        </div>
      </div>
    );
  }

  // Error state (inherited interface)
  if (error) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p style={{ color: theme.text.primary }} className="mb-4">Failed to load project calendar</p>
          <p style={{ color: theme.text.secondary }} className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`h-full ${className}`} style={{ backgroundColor: theme?.background?.primary || '#1f2937' }}>
        {/* FullCalendar with inherited interface */}
        <div 
          className="relative calendar-wrapper" 
          style={{ 
            height: height,
            minHeight: '500px',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Inherit FullCalendarView interface from my-tasks */}
          <FullCalendarView
            tasks={calendarTasks as any[]}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            height="100%"
          />
        </div>
      </div>

      {/* Inherit TaskDetailPanel interface from my-tasks */}
      {calendarState.isPanelOpen && calendarState.selectedTask && (
        <TaskDetailPanel
          task={calendarState.selectedTask}
          isOpen={calendarState.isPanelOpen}
          onClose={handleClosePanel}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </>
  );
};

export default ProjectCalendar;

// Export types for external use
export type { ProjectCalendarState };