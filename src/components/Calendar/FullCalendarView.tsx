"use client";

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import type { Task } from "@/types";
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    originalTask: Task;
    assignee?: string;
    description?: string;
    project?: string;
    status: string;
    priority: string;
    isMultiDay: boolean;
  };
}

export interface FullCalendarViewProps {
  tasks: Task[];
  onEventClick?: (task: Task) => void; // For viewing task details
  onDateClick?: (dateStr: string) => void; // For viewing date's tasks
  onEventDrop?: (taskId: string, newDateStr: string) => void; // For dragging tasks
  onEventResize?: (taskId: string, newStartDate: string, newEndDate: string) => void; // For resizing tasks
  onTaskCreate?: (taskData: any) => void; // For creating tasks
  height?: string;
  className?: string;
  key?: string | number; // Simple trigger for re-render when layout changes
}

// Convert tasks to FullCalendar events
const convertTasksToEvents = (tasks: Task[], getTaskColorsFunc: (task: Task) => { backgroundColor: string; borderColor: string }, t: (key: string) => string): CalendarEvent[] => {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }
  
  // Only log in development when needed for debugging
  if (process.env.NODE_ENV === 'development' && tasks.length > 0) {
    console.log('🔍 FullCalendarView: Converting', tasks.length, 'tasks');
  }

  return tasks.map(task => {
    try {
      let startDate: string;
      let endDate: string | undefined;
      
      // Handle different date formats for start date
      if (task.startDate) {
        if (Array.isArray(task.startDate) && task.startDate.length >= 3) {
          const [year, month, day] = task.startDate.map(Number);
          startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else {
          const date = new Date(task.startDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          startDate = `${year}-${month}-${day}`;
        }
      } else if (task.dueDate) {
        if (Array.isArray(task.dueDate) && task.dueDate.length >= 3) {
          const [year, month, day] = task.dueDate.map(Number);
          startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else if (task.dueDate !== 'No deadline') {
          const date = new Date(task.dueDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          startDate = `${year}-${month}-${day}`;
        } else {
          // Fallback to current date
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          startDate = `${year}-${month}-${day}`;
        }
      } else {
        // Fallback to current date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        startDate = `${year}-${month}-${day}`;
      }

  // Handle end date for multi-day tasks
      // Use deadline field from backend
      if (task.deadline && task.startDate) {
        let taskStartDate: Date;
        
        // Parse start date
        if (Array.isArray(task.startDate) && task.startDate.length >= 3) {
          const [year, month, day] = task.startDate.map(Number);
          taskStartDate = new Date(year, month - 1, day);
        } else {
          taskStartDate = new Date(task.startDate);
        }
        
        // Parse deadline (end date)
        const taskEndDate = new Date(task.deadline);
        
        // Check if multi-day task
        const isMultiDay = taskEndDate.getTime() !== taskStartDate.getTime();
        
        if (isMultiDay) {
          // For multi-day tasks, FullCalendar needs EXCLUSIVE end date (next day after actual end)
          const nextDay = new Date(taskEndDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const year = nextDay.getFullYear();
          const month = String(nextDay.getMonth() + 1).padStart(2, '0');
          const day = String(nextDay.getDate()).padStart(2, '0');
          endDate = `${year}-${month}-${day}`;
        } else {
          // For single-day tasks, end date same as start date
          endDate = startDate;
        }
            
      } else if (task.dueDate && task.startDate && task.dueDate !== 'No deadline') {
        // Handle dueDate vs startDate for multi-day display
        let taskStartDate: Date;
        let taskDueDate: Date;
        
        // Parse start date
        if (Array.isArray(task.startDate) && task.startDate.length >= 3) {
          const [year, month, day] = task.startDate.map(Number);
          taskStartDate = new Date(year, month - 1, day);
        } else {
          taskStartDate = new Date(task.startDate);
        }
        
        // Parse due date
        if (typeof task.dueDate === 'string' && task.dueDate !== 'No deadline') {
          taskDueDate = new Date(task.dueDate);
          
          // Only set endDate if task spans multiple days
          if (taskDueDate.getTime() !== taskStartDate.getTime()) {
            // FullCalendar expects EXCLUSIVE end date (next day after actual end)
            const nextDay = new Date(taskDueDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const year = nextDay.getFullYear();
            const month = String(nextDay.getMonth() + 1).padStart(2, '0');
            const day = String(nextDay.getDate()).padStart(2, '0');
            endDate = `${year}-${month}-${day}`;
          }
        }
      }

      // Always make deadline the day after start if missing
      if (!task.deadline && task.startDate) {
        const startDateObj = new Date(task.startDate);
        startDateObj.setDate(startDateObj.getDate() + 1);
        task.deadline = startDateObj.toISOString().split('T')[0];
        console.log('📝 Added default deadline to task:', {
          id: task.id,
          title: task.title,
          startDate: task.startDate,
          deadline: task.deadline
        });
      }
      
      // Get colors using local function
      const { backgroundColor, borderColor } = getTaskColorsFunc(task);
      
      // Check task status
      const isCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
      const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;

      // Check if this task is a multiday task - SIMPLE
      let hasMultipleDays = false;
      if (task.startDate && task.deadline) {
        const startDateStr = task.startDate.toISOString().split('T')[0];
        const deadlineStr = task.deadline;
        hasMultipleDays = startDateStr !== deadlineStr;
      }

      // Build task title with multilingual status indicators
      let titleSuffix = '';
      if (isCompleted) titleSuffix += ` ✓`;
      if (isOverdue) titleSuffix += ` ⚠️`;
      if (hasMultipleDays) titleSuffix += ` 📅`;

      return {
        id: task.id?.toString() || Math.random().toString(),
        title: `${task.title || t('calendar.events.untitledTask')}${titleSuffix}`,
        start: startDate,
        end: endDate,
        allDay: true,
        backgroundColor,
        borderColor,
        textColor: '#FFFFFF',
        extendedProps: {
          originalTask: task,
          assignee: task.assigneeId || t('calendar.events.unassigned'),
          description: task.description || '',
          project: task.projectId?.toString() || '',
          status: task.status || 'pending',
          priority: task.priority || 'low',
          isMultiDay: hasMultipleDays
        }
      };
    } catch (error) {
      console.error('Error converting task to event:', task, error);
      return null;
    }
  }).filter(Boolean) as CalendarEvent[];
};

export const FullCalendarView = ({
  tasks,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  height = "100%",
  className = ""
}: FullCalendarViewProps) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Task color function with theme integration
  const getTaskColors = (task: Task) => {
    const isCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
    const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;
    
    // Priority: completed > overdue > status > priority > default
    if (isCompleted) {
      return { backgroundColor: theme.status.success, borderColor: theme.status.success };
    }
    
    if (isOverdue) {
      return { backgroundColor: theme.status.error, borderColor: theme.status.error };
    }
    
    // Status-based colors with theme integration
    if (task.status === 'IN_PROGRESS' || task.status === 'in-progress') {
      return { backgroundColor: theme.status.warning, borderColor: theme.status.warning };
    }
    
    if (task.status === 'TESTING') {
      return { backgroundColor: theme.status.info, borderColor: theme.status.info };
    }
    
    if (task.status === 'REVIEW') {
      return { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' };
    }
    
    if (task.status === 'BLOCKED') {
      return { backgroundColor: theme.status.error, borderColor: theme.status.error };
    }
    
    // Priority-based colors (fallback)
    if (task.priority === 'high') {
      return { backgroundColor: theme.status.error, borderColor: theme.status.error };
    }
    
    if (task.priority === 'medium') {
      return { backgroundColor: theme.status.warning, borderColor: theme.status.warning };
    }
    
    // Default theme color
    return { backgroundColor: theme.status.success, borderColor: theme.status.success };
  };

  // Convert tasks to calendar events with theme and i18n support
  const calendarEvents = useMemo(() => {
    const events = convertTasksToEvents(tasks, getTaskColors, t);
    return events;
  }, [tasks, theme, messages]);

  // Auto-resize calendar when window resizes (simple solution)
  useEffect(() => {
    const handleResize = () => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        setTimeout(() => calendarApi.updateSize(), 100);
      }
    };

    window.addEventListener('resize', handleResize);
    // Also trigger on any layout changes
    const observer = new ResizeObserver(handleResize);
    if (calendarRef.current) {
      const element = (calendarRef.current as unknown as { el: HTMLElement }).el;
      if (element) {
        observer.observe(element.parentElement || element);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Event handlers for drag & drop
  const handleEventDrop = useCallback((info: EventDropArg) => {
    if (!onEventDrop) return;
    
    const taskId = info.event.id;
    const newDate = info.event.start;
    if (!newDate) return;
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const newDateStr = `${year}-${month}-${day}`;
    
    onEventDrop(taskId, newDateStr);
  }, [onEventDrop]);

  const handleEventResize = useCallback((info: { event: { id: string; start: Date | null; end: Date | null; extendedProps?: any } }) => {
    if (!onEventResize) return;
    
    const taskId = info.event.id;
    const startDate = info.event.start;
    let endDate = info.event.end;
    const originalTask = info.event.extendedProps?.originalTask;
    
    if (!startDate) return;
    
    console.log('⚡ FullCalendarView: Event resize detected:', { 
      taskId, 
      title: originalTask?.title,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
      originalStart: originalTask?.startDate,
      originalDeadline: originalTask?.deadline
    });
    
    // FullCalendar uses exclusive end dates (the end date is the day after the last day)
    // We need to subtract one day to get the actual end date for the API
    if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);
      endDate = adjustedEndDate;
      
    } else {
      endDate = startDate;
    }
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    onEventResize(taskId, formattedStartDate, formattedEndDate);
  }, [onEventResize]);

  // Event handlers
  const handleEventClick = useCallback((info: EventClickArg) => {
    const originalTask = info.event.extendedProps.originalTask;
    if (originalTask && onEventClick) {
      onEventClick(originalTask);
    }
  }, [onEventClick]);

  const lastClickTime = useRef<number>(0);
  
  const handleDateClick = useCallback((info: { date: Date; dateStr: string }) => {
    // ✅ FIX: Prevent duplicate clicks with debouncing
    const now = Date.now();
    if (lastClickTime.current && now - lastClickTime.current < 1000) {
      return;
    }
    lastClickTime.current = now;
    
    const clickedDate = info.date || new Date(info.dateStr);
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const day = String(clickedDate.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    if (onDateClick) {
      onDateClick(localDateStr);
    }
  }, [onDateClick]);

  // Custom event content renderer to show avatars
  const renderEventContent = useCallback((eventInfo: { event: { title: string; extendedProps?: { originalTask?: unknown } } }) => {
    const task = eventInfo.event.extendedProps?.originalTask as {
      assignees?: { id: string; name: string; avatar?: string; email?: string }[];
      assignedEmails?: string[];
    } | undefined;
    
    if (!task) {
      return null;
    }

    const assignedEmails = task.assignedEmails || [];
    const assignees = task.assignees || [];
    
    const totalAssignees = assignees.length + assignedEmails.length;

    return (
      <div className="flex items-center justify-between w-full px-1 py-0.5">
        <span
          className="text-xs font-medium truncate flex-1 mr-1"
          style={{ color: theme.text.inverse }}
        >
          {eventInfo.event.title}
        </span>
        
        {totalAssignees > 0 && (
          <div className="flex items-center -space-x-1 flex-shrink-0">
            {/* Show first 2 assignees */}
            {assignees.slice(0, 2).map((assignee, index: number) => (
              <UserAvatar
                key={assignee.id || index}
                name={assignee.name}
                avatar={assignee.avatar}
                email={assignee.email}
                size="sm"
                className="w-4 h-4 border border-white"
              />
            ))}
            
            {/* Show assigned emails - filter out emails that already have user objects */}
            {assignedEmails
              .filter((email: string) => 
                !assignees.some(assignee => assignee.email === email)
              )
              .slice(0, 2)
              .map((email: string) => (
                <UserAvatar
                  key={email}
                  name={email}
                  size="sm"
                  className="w-4 h-4 border border-white"
                />
              ))}
            
            {/* Show count if more than 4 total (excluding duplicates) */}
            {(() => {
              const uniqueEmailsCount = assignedEmails.filter((email: string) => 
                !assignees.some(assignee => assignee.email === email)
              ).length;
              const totalUniqueAssignees = assignees.length + uniqueEmailsCount;
              return totalUniqueAssignees > 4 && (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs border border-white"
                  style={{
                    backgroundColor: theme.background.muted,
                    color: theme.text.primary
                  }}
                >
                  +{totalUniqueAssignees - 4}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  }, [theme, t]);

  return (
    <div className={`w-full transition-all duration-300 ${className}`} style={{ height }}>
      <style jsx global>{`
        .fc {
          background-color: ${theme.background.primary} !important;
          color: ${theme.text.primary} !important;
        }
        .fc-toolbar {
          background-color: ${theme.background.primary} !important;
        }
        .fc-toolbar-title {
          color: ${theme.text.primary} !important;
        }
        .fc-button {
          background-color: ${theme.background.secondary} !important;
          border-color: ${theme.border.default} !important;
          color: ${theme.text.primary} !important;
        }
        .fc-button:hover {
          background-color: ${theme.background.tertiary} !important;
          border-color: ${theme.border.default} !important;
          color: ${theme.text.primary} !important;
        }
        .fc-button-active {
          background-color: ${theme.status.info} !important;
          border-color: ${theme.status.info} !important;
          color: ${theme.text.inverse} !important;
        }
        .fc-daygrid-day {
          background-color: ${theme.background.primary} !important;
        }
        .fc-day-today {
          background-color: ${theme.background.weakHover} !important;
        }
        .fc-col-header-cell {
          background-color: ${theme.background.secondary} !important;
          border-color: ${theme.border.default} !important;
        }
        .fc-col-header-cell-cushion {
          color: ${theme.text.secondary} !important;
        }
        .fc-daygrid-day-number {
          color: ${theme.text.primary} !important;
        }
        .fc-scrollgrid {
          border-color: ${theme.border.default} !important;
        }
        .fc-scrollgrid td, .fc-scrollgrid th {
          border-color: ${theme.border.default} !important;
        }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev today next',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        buttonText={{
          today: t('calendar.today'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day')
        }}
        height="100%"
        events={calendarEvents}
        
        // Calendar Interaction Settings
        editable={!!onEventDrop || !!onEventResize}
        droppable={!!onEventDrop}
        selectable={false}
        selectMirror={false}
        eventResizableFromStart={!!onEventResize}
        eventDurationEditable={!!onEventResize}

        // Event Handlers
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={onEventDrop ? handleEventDrop : undefined}
        eventResize={onEventResize ? handleEventResize : undefined}

        // Custom event content with avatars
        eventContent={renderEventContent}
        
        // Styling
        dayMaxEvents={false}
        weekends={true}
        firstDay={1} // Monday
        displayEventTime={false}
        eventDisplay="block"
        showNonCurrentDates={true}
        fixedWeekCount={false}
      />
    </div>
  );
};

export default FullCalendarView;

