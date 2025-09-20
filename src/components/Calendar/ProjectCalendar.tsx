"use client";

import React, { useState, useCallback } from 'react';
import { FullCalendarView } from './FullCalendarView';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { TaskListItem } from '@/components/TaskList/types';

// Project-specific calendar types
export interface ProjectCalendarProps {
  // Data props - will be provided by project context/hooks
  tasks?: any[]; // Project tasks in any format
  projectId?: string | number;
  projectName?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  height?: string;

  // Project-specific event handlers
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
    projectId?: string | number;
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
  height = '100%',
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  onTaskSave,
  onTaskDelete,
  onTaskCreate,
}) => {
  const [state, setState] = useState<ProjectCalendarState>({
    currentDate: new Date(),
    view: 'dayGridMonth',
    selectedTask: null,
    isPanelOpen: false,
  });

  // Project calendar handlers
  const handleEventClick = useCallback((task: any) => {
    console.log('Project calendar event clicked:', {
      id: task.id,
      title: task.title,
      projectName: task.projectName,
      projectId: task.projectId
    });

    // Convert to TaskListItem format for detail panel
    const taskItem: TaskListItem = {
      id: task.id,
      name: task.title, // TaskListItem uses 'name' instead of 'title'
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      startDate: task.startDate?.toISOString(),
      deadline: task.endDate?.toISOString(),
      assigneeName: task.assigneeName || task.assignee,
      project: projectName || task.projectName,
      projectName: projectName || task.projectName,
      projectId: projectId || task.projectId,
      assignees: [], // Required by the TaskListItem interface
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      selectedTask: taskItem,
      isPanelOpen: true,
    }));

    onEventClick?.(task);
  }, [onEventClick, projectId, projectName]);

  const handleDateClick = useCallback((dateStr: string) => {
    console.log('Project calendar date clicked:', dateStr);
    onDateClick?.(dateStr);
  }, [onDateClick]);

  const handleEventDrop = useCallback((taskId: string, newDateStr: string) => {
    console.log('Project calendar event dropped:', { taskId, newDateStr });
    onEventDrop?.(taskId, newDateStr);
  }, [onEventDrop]);

  const handleEventResize = useCallback((taskId: string, newStartDate: string, newEndDate: string) => {
    console.log('Project calendar event resized:', { taskId, newStartDate, newEndDate });
    onEventResize?.(taskId, newStartDate, newEndDate);
  }, [onEventResize]);

  const handleTaskSave = useCallback((taskId: string, updates: Partial<TaskListItem>) => {
    console.log('Project calendar task saved:', { taskId, updates });
    onTaskSave?.(taskId, updates);

    setState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, [onTaskSave]);

  const handleTaskDelete = useCallback((taskId: string) => {
    console.log('Project calendar task deleted:', taskId);
    onTaskDelete?.(taskId);

    setState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, [onTaskDelete]);

  const handleTaskCreate = useCallback((taskData: {
    name: string;
    description?: string;
    status?: string;
    startDate?: string;
    deadline?: string;
    priority?: string;
    assigneeId?: string;
  }) => {
    console.log('Project calendar task created:', taskData);

    const projectTaskData = {
      ...taskData,
      projectId,
    };

    onTaskCreate?.(projectTaskData);
  }, [onTaskCreate, projectId]);

  const handleClosePanel = useCallback(() => {
    setState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading project calendar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-600">
          <p>Error loading project calendar: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Calendar View */}
      <FullCalendarView
        tasks={tasks}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onTaskCreate={handleTaskCreate}
        height={height}
        key={`project-calendar-${projectId}`}
      />

      {/* Task Detail Panel */}
      {state.isPanelOpen && state.selectedTask && (
        <TaskDetailPanel
          task={state.selectedTask}
          isOpen={state.isPanelOpen}
          onClose={handleClosePanel}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
};

export default ProjectCalendar;
