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

export const FullCalendarView: React.FC<FullCalendarViewProps> = ({
  tasks,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  height = "100%",
  className = ""
}) => {
  const { theme } = useTheme();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Simple local color function (no backend dependency)
  const getTaskColors = (task: Task) => {
    const isCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
    const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;
    
    // Priority: completed > overdue > status > priority > default
    if (isCompleted) {
      return { backgroundColor: '#10b981', borderColor: '#059669' }; // Green
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
    
    // Default
    return { backgroundColor: '#6b7280', borderColor: '#4b5563' }; // Gray
  };

  // Convert tasks to calendar events
  const calendarEvents = useMemo(() => {
    const events = convertTasksToEvents(tasks, getTaskColors);
    console.log('📅 FullCalendar events:', events.length, events.slice(0, 3));
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

      console.log('🔄 Multi-day event dropped:', { 
        taskId, 
        newStart: startDateStr, 
        newEnd: endDateStr,
        duration: `${Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24))} days`
      });

      // Use resize handler for multi-day tasks to preserve both start and end
      onEventResize?.(taskId, startDateStr, endDateStr);
    } else {
      // Single day task - use original drop handler
      console.log('🔄 Single-day event dropped:', { taskId, newDate: startDateStr });
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
        
        // Custom styling
        eventDidMount={(info) => {
          const el = info.el;
          const priority = info.event.extendedProps?.priority || 'low';
          
          if (el && el.classList) {
            el.classList.add('fc-event-custom');
            el.classList.add(`fc-event-priority-${priority}`);
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
          padding: 0.75rem 0.5rem;
        }
        
        .fc-daygrid-day {
          background-color: ${theme?.background?.primary || '#1f2937'};
          color: ${theme?.text?.primary || '#ffffff'};
          min-height: 100px;
        }
        
        .fc-day-today {
          background-color: ${theme?.background?.secondary || '#374151'} !important;
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
        }
        
        .fc-event:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s ease;
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
          padding: 1rem 0;
          border: none;
          margin-bottom: 0;
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
        
        .fc-button-group {
          border: 1px solid ${theme?.border?.default || 'rgba(255, 255, 255, 0.2)'};
          border-radius: 6px;
          overflow: hidden;
          background-color: ${theme?.background?.primary || '#1f2937'};
        }
        
        .fc-button {
          background-color: transparent;
          border: none;
          color: ${theme?.text?.primary || '#ffffff'};
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fc-button:hover {
          background-color: ${theme?.background?.secondary || 'rgba(255, 255, 255, 0.1)'};
        }
        
        .fc-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .fc-button-active {
          background-color: ${theme?.background?.secondary || 'rgba(255, 255, 255, 0.15)'} !important;
          color: ${theme?.text?.primary || '#ffffff'} !important;
        }
        
        /* Navigation buttons group */
        .fc-toolbar-chunk:first-child .fc-button-group {
          display: flex;
          align-items: center;
        }
        
        .fc-prev-button, .fc-next-button {
          border-radius: 0 !important;
          padding: 0.25rem 0.375rem !important;
        }
        
        .fc-today-button {
          border-radius: 0 !important;
          padding: 0.25rem 0.5rem !important;
          font-size: 0.75rem !important;
          border-left: 1px solid ${theme?.border?.default || 'rgba(255, 255, 255, 0.1)'} !important;
          border-right: 1px solid ${theme?.border?.default || 'rgba(255, 255, 255, 0.1)'} !important;
        }
        
        /* View buttons (Month/Week) */
        .fc-toolbar-chunk:last-child .fc-button-group {
          display: flex;
          align-items: center;
        }
        
        .fc-dayGridMonth-button, .fc-dayGridWeek-button {
          padding: 0.25rem 0.75rem !important;
          font-size: 0.75rem !important;
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default FullCalendarView;