"use client";

import React, { useState } from "react";
import { useTasksContext } from "@/contexts/TasksContext";
import { FullCalendarView } from "@/components/Calendar";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useMyTasksShared } from "@/hooks/tasks/useMyTasksShared";
import type { Task } from "@/types";
import type { TaskListItem } from "@/components/TaskList/types";

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

const MyTaskCalendarPage = ({ 
  searchValue = ""
}: CalendarPageProps) => {
  const { theme } = useTheme();
  const { selectedTaskId, setSelectedTaskId } = useTasksContext();
  
  // Calendar state
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'dayGridMonth',
    selectedTask: null,
    isPanelOpen: false
  });

  // Use shared hook for all data and actions
  const {
    tasks,
    filteredTasks,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    actions,
    revalidate,
    convertTaskToTaskListItem
  } = useMyTasksShared({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc',
    searchValue
  });

  // Calendar-specific event handlers using shared actions

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

  // Task event handlers using shared actions
  const handleEventClick = (task: Task) => {
    setSelectedTaskId(task.id.toString());
    setCalendarState(prev => ({ 
      ...prev, 
      selectedTask: convertTaskToTaskListItem(task), 
      isPanelOpen: true 
    }));
  };

  const handleDateClick = React.useCallback(async (dateStr: string) => {
    // ✅ FIX: Enhanced duplicate prevention
    if (isCreating) {
      return;
    }
    
    try {
      await actions.onDateClick(dateStr);
    } catch (error) {
      console.error('❌ Calendar: Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  }, [isCreating, actions]);

  // Memoized date click handler for SimpleCalendar
  const handleSimpleDateClick = React.useCallback((date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    handleDateClick(dateStr);
  }, [handleDateClick]);

  // FullCalendar event drop handler - Use shared action
  const handleEventDrop = async (taskId: string, newDateStr: string) => {
    try {
      const [year, month, day] = newDateStr.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      const task = tasks.find(t => t.id.toString() === taskId);
      
      if (task) {
        await actions.onTaskDrop(task, localDate);
      }
    } catch (error) {
      console.error('❌ Calendar Page: FullCalendar drop update failed:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleEventResize = async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      const parseDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      };

      const task = tasks.find(t => t.id.toString() === taskId);
      if (task) {
        await actions.onTaskResize(task, parseDate(newStartDate), parseDate(newEndDate));
      }
    } catch (error) {
      console.error('❌ Calendar Page: FullCalendar resize update failed:', error);
      revalidate();
    }
  };

  // Task detail panel handlers using shared actions
  const handleTaskSave = async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      const task = tasks.find(t => t.id.toString() === taskId);
      if (task) {
        const taskListItem = convertTaskToTaskListItem(task);
        await actions.onTaskEdit({ ...taskListItem, ...updates });
      }
      setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
    } catch (error) {
      console.error('❌ Calendar: Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await actions.onTaskDelete(taskId);
      setCalendarState(prev => ({ ...prev, isPanelOpen: false, selectedTask: null }));
    } catch (error) {
      console.error('❌ Calendar: Failed to delete task:', error);
    }
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