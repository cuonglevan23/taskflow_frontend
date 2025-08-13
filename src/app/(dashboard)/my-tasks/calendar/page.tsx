"use client";

import React, { useState, useMemo } from "react";
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask, useMyTasksSummary } from "@/hooks/useTasks";
import { useTasksContext } from "@/contexts/TasksContext";;
import { FullCalendarView } from "@/components/Calendar";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTheme } from "@/layouts/hooks/useTheme";
import type { Task, CreateTaskDTO } from "@/types";
import type { TaskListItem } from "@/components/TaskList/types";
import { CookieAuth } from '@/utils/cookieAuth';

// Clean TypeScript interfaces
interface CalendarPageProps {
  searchValue?: string;
}

interface CalendarState {
  currentDate: Date;
  view: 'dayGridMonth' | 'dayGridWeek';
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
}

const MyTaskCalendarPage: React.FC<CalendarPageProps> = ({ 
  searchValue = ""
}) => {
  const { theme } = useTheme();
  const { selectedTaskId, setSelectedTaskId } = useTasksContext();
  
  // Calendar state
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'dayGridMonth',
    selectedTask: null,
    isPanelOpen: false
  });

  // Data fetching with new My Tasks Summary API to get ALL tasks including completed
  const { tasks, isLoading, error, revalidate } = useMyTasksSummary({
    page: 0,
    size: 1000, // Get all tasks for calendar view
    sortBy: 'startDate',
    sortDir: 'desc'
  });

  // Mutations
  const { updateTask, isUpdating } = useUpdateTask();
  const { createTask, isCreating } = useCreateTask();
  const { deleteTask, isDeleting } = useDeleteTask();

  // Convert Task to TaskListItem for TaskDetailPanel compatibility - Memoized
  const convertTaskToTaskListItem = React.useCallback((task: Task): TaskListItem => {
    // Use the correct startDate and endDate from Task object (from transformMyTasksSummary)
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return undefined;
      if (typeof date === 'string') return date;
      if (date instanceof Date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      return undefined;
    };

    return {
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: task.creatorName ? [{
        id: 'creator',
        name: task.creatorName,
        email: '',
      }] : [],
      dueDate: task.dueDate,
      startDate: formatDate(task.startDate), // Use actual startDate from backend
      deadline: formatDate(task.endDate),    // Map endDate to deadline for backend compatibility
      priority: (task.priority as any) || 'medium',
      status: task.status === 'completed' ? 'done' : 
              task.status === 'in-progress' ? 'in_progress' : 
              'todo',
      tags: task.tags || [],
      project: task.tagText || 'Default Project',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }, []);

  // Filter tasks based on search - INCLUDE ALL TASKS including completed
  const filteredTasks = useMemo(() => {
    if (!searchValue.trim()) return tasks; // Show ALL tasks including completed
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [tasks, searchValue]);

  // Calendar navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(calendarState.currentDate);
    if (calendarState.view === 'dayGridMonth') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCalendarState(prev => ({ ...prev, currentDate: newDate }));
  };

  const handleNext = () => {
    const newDate = new Date(calendarState.currentDate);
    if (calendarState.view === 'dayGridMonth') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCalendarState(prev => ({ ...prev, currentDate: newDate }));
  };

  const handleToday = () => {
    setCalendarState(prev => ({ ...prev, currentDate: new Date() }));
  };

  // Task event handlers
  const handleEventClick = (task: Task) => {
    setSelectedTaskId(task.id.toString());
    setCalendarState(prev => ({ 
      ...prev, 
      selectedTask: convertTaskToTaskListItem(task), 
      isPanelOpen: true 
    }));
  };

  const handleDateClick = React.useCallback(async (dateStr: string) => {
    if (isCreating) return; // Prevent multiple clicks
    
    // Get user ID from token for backend format
    const tokenPayload = CookieAuth.getTokenPayload();
    const userInfo = CookieAuth.getUserInfo();
    
    // Parse the date string to create proper Date object
    const dateParts = dateStr.split('-');
    const selectedDate = new Date(
      parseInt(dateParts[0]), 
      parseInt(dateParts[1]) - 1, // Month is 0-indexed
      parseInt(dateParts[2]),
      12, 0, 0, 0 // Set to noon to avoid timezone issues
    );
    

    
    // Create task with default name immediately
    const taskData: CreateTaskDTO = {
      title: 'New Task',     // Default task name
      description: '',
      status: 'TODO',        // Backend format
      priority: 'MEDIUM',    // Backend format  
      startDate: dateStr,    // Primary field for calendar display (camelCase)
      deadline: dateStr,     // Backend expects 'deadline' for compatibility
      dueDate: dateStr,      // Also set dueDate field to ensure proper handling
      dueDateISO: selectedDate, // Add ISO date object
      creatorId: tokenPayload?.userId || parseInt(userInfo.id || '1'),
      assignedToIds: [],
      projectId: null,
      groupId: null,
    };
    
    console.log('📤 Calendar Page: Creating default task:', {
      taskData: taskData,
      date: dateStr
    });
    
    try {
      await createTask(taskData);
      console.log('✅ Calendar: Default task created successfully');
    } catch (error) {
      console.error('❌ Calendar: Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  }, [isCreating, createTask]);

  // Memoized date click handler for SimpleCalendar
  const handleSimpleDateClick = React.useCallback((date: Date) => {
    // Create task directly, no panel
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    handleDateClick(dateStr);
  }, [handleDateClick]);

  // Enhanced task drop handler with optimistic updates
  const handleTaskDrop = async (task: Task, newDate: Date) => {
    // Create a local date at noon to avoid timezone edge cases
    const localDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 12, 0, 0, 0);
    
    // Format as simple YYYY-MM-DD
    const simpleDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    
    try {
      // Optimistic update - immediately update UI
      const updatedTask = { ...task, dueDate: simpleDate };
      
      await updateTask({ 
        id: task.id.toString(), 
        data: {
          deadline: simpleDate,
        }
      });
      
      // Force refresh calendar data after successful update
      setTimeout(() => revalidate(), 100);
    } catch (error) {
      console.error('❌ Calendar Page: Task drop update failed:', error);
      // Revert optimistic update on error
      revalidate();
    }
  };

  // Task resize handler for multi-day tasks
  const handleTaskResize = async (task: Task, newStartDate: Date, newEndDate: Date) => {
    // Format dates
    const formatDate = (date: Date) => {
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
      return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    };

    const startDateStr = formatDate(newStartDate);
    const endDateStr = formatDate(newEndDate);

    try {
      await updateTask({ 
        id: task.id.toString(), 
        data: {
          startDate: startDateStr, // Start date of multi-day task
          deadline: endDateStr,    // End date of multi-day task
        }
      });
    } catch (error) {
      console.error('❌ Calendar Page: Task resize update failed:', error);
      revalidate();
    }
  };

  // FullCalendar event drop handler - Send exact date
  const handleEventDrop = async (taskId: string, newDateStr: string) => {
    try {
      // Parse the date and ensure it's in local timezone
      const [year, month, day] = newDateStr.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      const exactDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      await updateTask({ 
        id: taskId, 
        data: {
          deadline: exactDate,
        }
      });
      // Force refresh calendar data to show updated task
      revalidate();
    } catch (error) {
      console.error('❌ Calendar Page: FullCalendar drop update failed:', error);
      alert('Failed to update task. Please try again.');
      revalidate();
    }
  };

  const handleEventResize = async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      await updateTask({ 
        id: taskId, 
        data: {
          startDate: newStartDate, // Start date for multi-day tasks
          deadline: newEndDate,    // End date for multi-day tasks
        }
      });
      
      // Force refresh calendar data with delay to ensure backend has processed
      setTimeout(() => revalidate(), 100);
    } catch (error) {
      console.error('❌ Calendar Page: FullCalendar resize update failed:', error);
      revalidate();
    }
  };

  // Task detail panel handlers - Only for editing existing tasks
  const handleTaskSave = async (taskId: string, updates: Partial<TaskListItem>) => {
    // Only handle existing task updates (no more new task creation via panel)
    const backendUpdates: Partial<any> = {};
    
    if (updates.name !== undefined) backendUpdates.title = updates.name;
    if (updates.description !== undefined) backendUpdates.description = updates.description;
    if (updates.dueDate !== undefined) backendUpdates.deadline = updates.dueDate;
    if (updates.startDate !== undefined) backendUpdates.deadline = updates.startDate; // Backend uses deadline field
    if (updates.priority !== undefined) {
      backendUpdates.priority = updates.priority.toUpperCase();
    }
    if (updates.status !== undefined) {
      const statusMap = {
        'todo': 'TODO',
        'in_progress': 'IN_PROGRESS', 
        'done': 'DONE',
        'review': 'REVIEW',
        'cancelled': 'BLOCKED'
      };
      backendUpdates.status = statusMap[updates.status] || 'TODO';
    }

    console.log('🔄 Calendar: Updating existing task:', {
      taskId,
      taskListItemUpdates: updates,
      backendUpdates
    });

    try {
      await updateTask({
        id: taskId,
        data: backendUpdates
      });
      console.log('✅ Calendar: Task updated successfully');
    } catch (error) {
      console.error('❌ Calendar: Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
    
    setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
    setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  };

  const handleClosePanel = () => {
    setSelectedTaskId(null);
    setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: theme.text.secondary }}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <p style={{ color: theme.text.primary }} className="mb-4">Failed to load tasks</p>
          <button 
            onClick={() => revalidate()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full" style={{ backgroundColor: theme?.background?.primary || '#1f2937' }}>
        {/* Calendar Header - Remove duplicate since SimpleCalendar has its own header */}
        
        {/* FullCalendar has its own header with navigation and view controls */}

        {/* FullCalendar with complete drag/resize functionality */}
        <div 
          className="relative calendar-wrapper" 
          style={{ 
            height: 'calc(100vh - 80px)', 
            minHeight: '500px',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          
          <FullCalendarView
            tasks={filteredTasks || []}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            height="100%"
          />
          
          {/* Enhanced loading indicator with error feedback */}
          {(isCreating || isUpdating || isDeleting) && (
            <div className="absolute top-4 right-4 z-50">
              <div className="bg-blue-500 text-white rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>
                  {isCreating && "Creating task..."}
                  {isUpdating && "Updating task..."}
                  {isDeleting && "Deleting task..."}
                </span>
              </div>
            </div>
          )}

          {/* Error feedback when operations fail */}
          {error && (
            <div className="absolute top-4 right-4 z-50">
              <div className="bg-red-500 text-white rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
                <span>❌ Operation failed - please try again</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={calendarState.selectedTask}
        isOpen={calendarState.isPanelOpen}
        onClose={handleClosePanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </>
  );

};

export default MyTaskCalendarPage;