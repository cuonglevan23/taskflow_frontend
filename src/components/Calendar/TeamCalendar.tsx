"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { FullCalendarView } from './';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { TaskListItem } from '@/components/TaskList/types';
import { useTheme } from '@/layouts/hooks/useTheme';

// Team-specific calendar types
export interface TeamCalendarProps {
  // Data props - will be provided by team context/hooks
  tasks?: any[]; // Team tasks in any format
  teamId?: string;
  teamName?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  height?: string;
  
  // Team-specific event handlers
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
    teamId?: string;
  }) => void;
}

interface TeamCalendarState {
  currentDate: Date;
  view: 'dayGridMonth' | 'dayGridWeek';
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  tasks = [],
  teamId,
  teamName,
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
  const { theme } = useTheme();

  const [state, setState] = useState<TeamCalendarState>({
    currentDate: new Date(),
    view: 'dayGridMonth',
    selectedTask: null,
    isPanelOpen: false,
  });

  // Team calendar handlers
  const handleEventClick = useCallback((task: any) => {
    console.log('Team calendar event clicked:', task);
    
    // Convert to TaskListItem format for detail panel
    const taskItem: TaskListItem = {
      id: task.id,
      title: task.title,
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: task.startDate?.toISOString(),
      deadline: task.endDate?.toISOString(),
      assigneeName: task.assignee,
      projectName: teamName || 'Team',
      teamId,
    };

    setState(prev => ({
      ...prev,
      selectedTask: taskItem,
      isPanelOpen: true,
    }));

    onEventClick?.(task);
  }, [onEventClick, teamName, teamId]);

  const handleDateClick = useCallback((dateStr: string) => {
    console.log('Team calendar date clicked:', dateStr);
    onDateClick?.(dateStr);
  }, [onDateClick]);

  const handleEventDrop = useCallback((taskId: string, newDateStr: string) => {
    console.log('Team calendar event dropped:', { taskId, newDateStr });
    onEventDrop?.(taskId, newDateStr);
  }, [onEventDrop]);

  const handleEventResize = useCallback((taskId: string, newStartDate: string, newEndDate: string) => {
    console.log('Team calendar event resized:', { taskId, newStartDate, newEndDate });
    onEventResize?.(taskId, newStartDate, newEndDate);
  }, [onEventResize]);

  const handleTaskSave = useCallback((taskId: string, updates: Partial<TaskListItem>) => {
    console.log('Team calendar task saved:', { taskId, updates });
    onTaskSave?.(taskId, updates);
    
    setState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, [onTaskSave]);

  const handleTaskDelete = useCallback((taskId: string) => {
    console.log('Team calendar task deleted:', taskId);
    onTaskDelete?.(taskId);
    
    setState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, [onTaskDelete]);

  const handleTaskCreate = useCallback((taskData: any) => {
    console.log('Team calendar task created:', taskData);
    
    const teamTaskData = {
      ...taskData,
      teamId,
    };
    
    onTaskCreate?.(teamTaskData);
  }, [onTaskCreate, teamId]);

  const handleClosePanel = useCallback(() => {
    setState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center h-full ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-lg" style={{ color: theme.text.secondary }}>
          Loading team calendar...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center h-full ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-lg text-red-500">
          Error loading team calendar: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Team Calendar View */}
      <FullCalendarView
        tasks={tasks}
        height={height}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onTaskCreate={handleTaskCreate}
        className="h-full"
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

export default TeamCalendar;