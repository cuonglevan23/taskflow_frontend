"use client";

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import { useTheme } from "@/layouts/hooks/useTheme";
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
const convertTasksToEvents = (tasks: Task[], getTaskColorsFunc: (task: Task) => { backgroundColor: string; borderColor: string }): CalendarEvent[] => {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }
  
      console.log('🔍 FullCalendarView: Converting tasks:', tasks.map(t => ({
    id: t.id,
    title: t.title,
    startDate: t.startDate,
    deadline: t.deadline,
    dueDate: t.dueDate,
    dueDateISO: t.dueDateISO
  })));
  
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



      return {
        id: task.id?.toString() || Math.random().toString(),
        title: `${task.title || 'Untitled Task'}${isCompleted ? ' ✓' : ''}${isOverdue ? ' ⚠️' : ''}${hasMultipleDays ? ' 📅' : ''}`,
        start: startDate,
        end: endDate,  // This is set for all tasks with deadline 
        allDay: true,
        backgroundColor,
        borderColor,
        textColor: '#FFFFFF',
        extendedProps: {
          originalTask: task,
          assignee: task.assigneeId || 'Unassigned',
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
  const { theme } = useTheme();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Simple local color function (no backend dependency)
  const getTaskColors = (task: Task) => {
    const isCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
    const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;
    
    // Priority: completed > overdue > status > priority > default
    if (isCompleted) {
      return { backgroundColor: '#b8acff', borderColor: '#b8acff' }; // Purple for completed
    }
    
    if (isOverdue) {
      return { backgroundColor: '#dc2626', borderColor: '#991b1b' }; // Red
    }
    
    // Status-based colors
    if (task.status === 'IN_PROGRESS' || task.status === 'in-progress') {
      return { backgroundColor: '#f59e0b', borderColor: '#d97706' }; // Orange
    }
    
    if (task.status === 'TESTING') {
      return { backgroundColor: '#3b82f6', borderColor: '#1d4ed8' }; // Blue
    }
    
    if (task.status === 'REVIEW') {
      return { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' }; // Purple
    }
    
    if (task.status === 'BLOCKED') {
      return { backgroundColor: '#dc2626', borderColor: '#991b1b' }; // Red
    }
    
    // Priority-based colors (fallback)
    if (task.priority === 'high') {
      return { backgroundColor: '#ef4444', borderColor: '#dc2626' }; // Red
    }
    
    if (task.priority === 'medium') {
      return { backgroundColor: '#f59e0b', borderColor: '#d97706' }; // Orange
    }
    
    // Default theme color
    return { backgroundColor: '#5da283', borderColor: '#5da283' }; // Green theme
  };

  // Convert tasks to calendar events
  const calendarEvents = useMemo(() => {
    const events = convertTasksToEvents(tasks, getTaskColors);

    return events;
  }, [tasks]);

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
    
    // Debug log for calendar task data
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Calendar task data:', {
        title: eventInfo.event.title,
        hasTask: !!task,
        assigneesCount: task?.assignees?.length || 0,
        assignedEmailsCount: task?.assignedEmails?.length || 0
      });
    }
    
    if (!task) {
      return null;
    }

    const assignedEmails = task.assignedEmails || [];
    const assignees = task.assignees || [];
    
    // Since assignees type doesn't have email field, we'll show both but limit to avoid overcrowding
    const totalAssignees = assignees.length + assignedEmails.length;

    return (
      <div className="flex items-center justify-between w-full px-1 py-0.5">
        <span className="text-xs font-medium truncate flex-1 mr-1">
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
                <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white border border-white">
                  +{totalUniqueAssignees - 4}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  }, []);

  // Removed event handlers for drag, drop, and resize since calendar is read-only

  return (
    <div className={`w-full transition-all duration-300 ${className}`} style={{ height }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev today next',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        height="100%"
        events={calendarEvents}
        
                // Calendar Interaction Settings - Enable drag & drop when handlers are provided
        editable={!!onEventDrop || !!onEventResize} // Enable drag & drop if handlers provided
        droppable={!!onEventDrop} // Enable dropping if handler provided
        selectable={false} // Keep date selection disabled
        selectMirror={false} // Disable selection mirror
        eventResizableFromStart={!!onEventResize} // Enable resizing from start if handler provided
        eventDurationEditable={!!onEventResize} // Enable duration editing if handler provided
        
        // Event Handlers
        eventClick={handleEventClick} // Keep event click for viewing details
        dateClick={handleDateClick} // Keep date click for creating tasks
        eventDrop={onEventDrop ? handleEventDrop : undefined} // Add drop handler
        eventResize={onEventResize ? handleEventResize : undefined} // Add resize handler
        
        // Custom event content with avatars
        eventContent={renderEventContent}
        
        // Styling
        dayMaxEvents={false}
        weekends={true}
        firstDay={1} // Monday
        displayEventTime={false}
        nowIndicator={true}
        eventDisplay="block"
        
        // Multi-day event settings
        eventOverlap={true}
        eventConstraint={undefined}
        selectOverlap={true}
        buttonText={{
          today: 'Today',       // đổi từ "today" → "Today"
          month: 'Month',
          week: 'Week',
          day: 'Day'
        }}

        
        // Custom styling
        eventDidMount={(info) => {
          const el = info.el;
          const priority = info.event.extendedProps?.priority || 'low';
          const status = info.event.extendedProps?.status || '';
          const originalTask = info.event.extendedProps?.originalTask;
          const isCompleted = originalTask?.completed || status === 'completed' || status === 'DONE';
          
          if (el && el.classList) {
            el.classList.add('fc-event-custom');
            el.classList.add(`fc-event-priority-${priority}`);
            
            if (isCompleted) {
              el.classList.add('fc-event-completed');
            }
          }
        }}
      />

      {/* FullCalendar Custom Styles */}
      <style jsx global>{`
        .fc {
          font-family: inherit !important;
          background-color: ${theme?.background?.primary || '#1f2937'};
          color: ${theme?.text?.primary || '#ffffff'};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
        }
        
        .fc-col-header-cell {
          background-color: ${theme?.background?.secondary || '#374151'};
          color: ${theme?.text?.primary || '#ffffff'};
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0 0;
        }
        
        .fc-daygrid-day {
          background-color: ${theme?.background?.primary || '#1f2937'};
          color: ${theme?.text?.primary || '#ffffff'};
          min-height: 100px;
        }
        
        .fc-day-today {
          background-color: ${theme?.background?.secondary || '#1e1f21'} !important;
        }
        
        .fc-daygrid-day-number {
          color: ${theme?.text?.primary || '#ffffff'};
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.5rem;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          background-color: #3B82F6;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .fc-event {
          border-radius: 6px !important;
          font-size: 12px;
          font-weight: 500;
          margin: 1px;
          cursor: pointer;
          min-height: 36px;
          height: auto;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          padding: 6px 8px;
          line-height: 1.3;
        }
        
        .fc-event-title {
          word-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        
        .fc-event:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .fc-event.fc-event-completed {
          opacity: 0.5;
          box-shadow: none;
        }
        
        .fc-event-custom {
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .fc-event-priority-high {
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }
        
        .fc-event-priority-medium {
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
        }
        
        .fc-event-priority-low {
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        
        /* Clean Minimal Toolbar styling */
        .fc-toolbar {
          background-color: transparent;
          padding: 5px 5px;
          border: none;
          
          border-bottom: 1px solid ${theme?.border?.default || 'rgba(255, 255, 255, 0.1)'};
        }
        
        .fc-toolbar-chunk {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .fc-toolbar-title {
          color: ${theme?.text?.primary || '#ffffff'};
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          
        }
        .fc .fc-toolbar.fc-header-toolbar {
          margin: 0;
        }
        /* trạng thái bình thường: chỉ có text */
        .fc .fc-button-primary {
          background-color: transparent !important;
          border: none !important;
          color: #fff;
          box-shadow: none !important;
         
        
        }

        /* hover: nền mờ */
        .fc .fc-button-primary:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border: none !important;
         
        }

        /* active (đang chọn): nền xanh nổi bật */
        .fc .fc-button-primary.fc-button-active {
          background-color:rgba(255, 255, 255, .06)!important; /* xanh Tailwind emerald-500 */
          color: white !important;
          border: none !important;
   
        }

        /* disabled: chỉ text xám */
        .fc .fc-button-primary:disabled {
          background-color: transparent !important;
          border: none !important;
          color: #6b7280 !important; /* text gray */
       
        }
        


      `}</style>
    </div>
  );
};

export default FullCalendarView;