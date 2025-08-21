"use client";

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "@/layouts/hooks/useTheme";
import type { Task } from "@/types";

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
  onEventClick: (task: Task) => void;
  onDateClick: (dateStr: string) => void;
  onEventDrop?: (taskId: string, newDate: string) => void;
  onEventResize?: (taskId: string, newStartDate: string, newEndDate: string) => void;
  height?: string;
  className?: string;
  key?: string | number; // Simple trigger for re-render when layout changes
}

// Convert tasks to FullCalendar events
const convertTasksToEvents = (tasks: Task[], getTaskColorsFunc: (task: Task) => any): CalendarEvent[] => {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
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
      if (task.endDate && task.startDate) {
        let taskEndDate: Date;
        
        if (Array.isArray(task.endDate) && task.endDate.length >= 3) {
          const [year, month, day] = task.endDate.map(Number);
          taskEndDate = new Date(year, month - 1, day);
        } else {
          taskEndDate = new Date(task.endDate);
        }
        
        // FullCalendar expects EXCLUSIVE end date (next day after actual end)
        const nextDay = new Date(taskEndDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const year = nextDay.getFullYear();
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const day = String(nextDay.getDate()).padStart(2, '0');
        endDate = `${year}-${month}-${day}`;
      }

      // Get colors using local function
      const { backgroundColor, borderColor } = getTaskColorsFunc(task);
      
      // Check task status
      const isCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
      const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;
      const isMultiDay = !!endDate && endDate !== startDate;



      return {
        id: task.id?.toString() || Math.random().toString(),
        title: `${task.title || 'Untitled Task'}${isCompleted ? ' ✓' : ''}${isOverdue ? ' ⚠️' : ''}${isMultiDay ? ' 📅' : ''}`,
        start: startDate,
        end: endDate,
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
          isMultiDay
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
    const calendarElement = calendarRef.current?.elRef?.current;
    if (calendarElement) {
      observer.observe(calendarElement.parentElement || calendarElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Event handlers
  const handleEventClick = useCallback((info: any) => {
    const originalTask = info.event.extendedProps.originalTask;
    if (originalTask) {
      onEventClick(originalTask);
    }
  }, [onEventClick]);

  const handleDateClick = useCallback((info: any) => {
    // ✅ FIX: Prevent duplicate clicks with debouncing
    const now = Date.now();
    if (handleDateClick.lastClickTime && now - handleDateClick.lastClickTime < 1000) {
      return;
    }
    handleDateClick.lastClickTime = now;
    
    const clickedDate = info.date || new Date(info.dateStr);
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const day = String(clickedDate.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    onDateClick(localDateStr);
  }, [onDateClick]);

  const handleEventDrop = useCallback((info: any) => {
    const taskId = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end;

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(newStart);

    // If task has end date (multi-day), preserve the duration
    if (newEnd) {
      // FullCalendar end is exclusive, so subtract 1 day for actual end date
      const actualEndDate = new Date(newEnd);
      actualEndDate.setDate(actualEndDate.getDate() - 1);
      const endDateStr = formatDate(actualEndDate);



      // Use resize handler for multi-day tasks to preserve both start and end
      onEventResize?.(taskId, startDateStr, endDateStr);
    } else {
      // Single day task - use original drop handler

      onEventDrop?.(taskId, startDateStr);
    }
  }, [onEventDrop, onEventResize]);

  const handleEventResize = useCallback((info: any) => {
    const taskId = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end;
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDateStr = formatDate(newStart);
    // FullCalendar end is exclusive, so subtract 1 day for actual end date
    const actualEndDate = new Date(newEnd);
    actualEndDate.setDate(actualEndDate.getDate() - 1);
    const endDateStr = formatDate(actualEndDate);
    
    console.log('🔧 Event resized:', { 
      taskId, 
      newStart: startDateStr, 
      newEnd: endDateStr,
      rawEnd: formatDate(newEnd)
    });
    
    onEventResize?.(taskId, startDateStr, endDateStr);
  }, [onEventResize]);

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
        
        // Drag & Drop & Resize Settings
        editable={true}
        droppable={true}
        selectable={true}
        selectMirror={true}
        eventResizableFromStart={true}  // Allow resize from both start and end
        eventDurationEditable={true}
        
        // Event Handlers
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        
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