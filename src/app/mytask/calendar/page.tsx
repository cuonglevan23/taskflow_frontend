"use client";

import React, { useState, useRef } from "react";
import { useTaskManagementContext } from "../context/TaskManagementContext";
import { useTaskActions } from "../hooks";
import { TaskListItem } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTheme } from "@/layouts/hooks/useTheme";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import CalendarHeader from "@/components/Calendar/CalendarHeader";

interface MyTaskCalendarPageProps {
  searchValue?: string;
}

const MyTaskCalendarPage: React.FC<MyTaskCalendarPageProps> = ({ 
  searchValue = ""
}) => {
  const { theme } = useTheme();
  const taskManagement = useTaskManagementContext();
  const taskActions = useTaskActions({ taskActions: taskManagement });
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert TaskListItem to FullCalendar Event format
  const convertToFullCalendarEvents = (tasks: TaskListItem[]) => {
    return tasks.map(task => {
      const startDate = task.startDate || task.dueDate || new Date().toISOString().split('T')[0];
      const endDate = task.dueDate || task.startDate || new Date().toISOString().split('T')[0];
      
      console.log('Converting task:', task.name, 'startDate:', startDate, 'endDate:', endDate);
      
      // For multi-day tasks, ensure proper end date for FullCalendar
      // FullCalendar expects end date to be the day AFTER the last day for all-day events
      let fcEndDate = endDate;
      const isMultiDay = startDate !== endDate;
      
      if (isMultiDay) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        fcEndDate = nextDay.toISOString().split('T')[0];
        console.log('Multi-day task detected, FC end date:', fcEndDate);
      }
      
      const event = {
        id: task.id,
        title: task.name,
        start: startDate,
        end: fcEndDate,
        allDay: true, // Ensure it's treated as all-day event for proper spanning
        backgroundColor: task.priority === 'high' ? '#8B5CF6' : 
                       task.priority === 'medium' ? '#06B6D4' : '#10B981',
        borderColor: task.priority === 'high' ? '#7C3AED' : 
                    task.priority === 'medium' ? '#0891B2' : '#059669',
        textColor: '#FFFFFF',
        extendedProps: {
          originalTask: task,
          assignee: 'Unassigned', // TODO: Add assignedTo field to TaskListItem type
          description: task.description,
          project: task.project,
          status: task.status,
          priority: task.priority,
          isMultiDay: isMultiDay
        }
      };
      
      console.log('FullCalendar event created:', event);
      return event;
    });
  };

  // Filter tasks based on search
  const filteredTasks = React.useMemo(() => {
    if (!searchValue.trim()) return taskManagement.tasks;
    return taskManagement.tasks.filter(task => 
      task.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.project?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [taskManagement.tasks, searchValue]);

  // Convert filtered tasks to FullCalendar events
  const calendarEvents = convertToFullCalendarEvents(filteredTasks);
  console.log('Calendar events recalculated:', calendarEvents.length, 'tasks');

  // Task detail panel logic
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    console.log('Calendar handleTaskSave called:', taskId, updates);
    taskManagement.updateTask(taskId, updates);
    
    // Force calendar re-render by updating currentDate (triggers key change)
    setTimeout(() => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
        console.log('Calendar re-rendered after task update');
      }
    }, 100);
  };

  const handleTaskDelete = (taskId: string) => {
    console.log('Calendar handleTaskDelete called:', taskId);
    taskManagement.deleteTask(taskId);
    
    // Force calendar re-render
    setTimeout(() => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
        console.log('Calendar re-rendered after task delete');
      }
    }, 100);
  };

  // FullCalendar event handlers
  const handleEventClick = (info: any) => {
    const originalTask = info.event.extendedProps.originalTask;
    if (originalTask) {
      taskActions.onTaskClick?.(originalTask);
    }
  };

  const handleDateClick = (info: any) => {
    // Create new task for the selected date
    const dateStr = info.dateStr;
    console.log('Creating task for date:', dateStr);
    
    // Create single-day task by default (user can edit to extend duration)
    const taskData = {
      name: 'New Task',
      dueDate: dateStr,
      startDate: dateStr,
      project: '',
      status: 'todo' as const
    };
    
    console.log('Task data being created:', taskData);
    taskActions.onCreateTask?.(taskData);
  };

  const handleEventDrop = (info: any) => {
    // Update task with new date
    const taskId = info.event.id;
    const newStart = info.event.start;
    const dateStr = newStart.toISOString().split('T')[0];
    
    taskManagement.updateTask(taskId, {
      dueDate: dateStr,
      startDate: dateStr
    });
  };

  const handleEventResize = (info: any) => {
    // Update task end date when resized
    const taskId = info.event.id;
    const newEnd = info.event.end;
    const endDateStr = newEnd ? newEnd.toISOString().split('T')[0] : null;
    
    if (endDateStr) {
      taskManagement.updateTask(taskId, {
        dueDate: endDateStr
      });
    }
  };

  // Calendar navigation handlers
  const handlePrevious = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleCreateTaskFromHeader = () => {
    // Create test multi-day task
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 5 days later
    
    taskActions.onCreateTask?.({
      name: 'Test Multi-day Task (5 days)',
      dueDate: endDate,
      startDate: startDate,
      project: '',
      status: 'todo'
    });
    console.log('Created test multi-day task:', startDate, 'to', endDate);
  };

  // Handle view changes from context
  React.useEffect(() => {
    console.log('Calendar view from context changed to:', taskManagement.calendarView);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      console.log('Attempting to change FullCalendar view to:', taskManagement.calendarView);
      try {
        calendarApi.changeView(taskManagement.calendarView);
        console.log('Successfully changed FullCalendar view to:', taskManagement.calendarView);
      } catch (error) {
        console.error('Failed to change calendar view:', error);
      }
    }
  }, [taskManagement.calendarView]);

  // Debug task changes
  React.useEffect(() => {
    console.log('=== TASKS CHANGED ===');
    console.log('Total tasks:', taskManagement.tasks.length);
    taskManagement.tasks.forEach(task => {
      console.log(`Task ${task.name}: startDate=${task.startDate}, dueDate=${task.dueDate}`);
    });
    console.log('===================');
  }, [taskManagement.tasks]);

  return (
    <>
      <div className="h-full" style={{ backgroundColor: theme.background.primary }}>
        {/* Custom Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
        />
        
        <FullCalendar
          key={`${taskManagement.calendarView}-${taskManagement.tasks.length}-${JSON.stringify(taskManagement.tasks.map(t => t.id + t.startDate + t.dueDate))}`} // Force re-render when view or tasks change
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView={taskManagement.calendarView}
          headerToolbar={false}
          titleFormat={{ year: 'numeric', month: 'long' }}
          height="100%"
          events={calendarEvents}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDisplay="block"
          dayMaxEvents={false}
          weekends={true}
          firstDay={1} // Start week on Monday
          weekNumberCalculation="ISO"
          displayEventTime={false}

          nowIndicator={true}
          businessHours={false}
          themeSystem="standard"
          // Custom styling
          eventDidMount={(info) => {
            // Add custom styling to events
            const el = info.el;
            const priority = info.event.extendedProps.priority;
            
            // Add priority indicator
            if (priority === 'high') {
              el.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.4)';
            } else if (priority === 'medium') {
              el.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.4)';
            } else {
              el.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.4)';
            }
            
            // Add hover effects
            el.style.borderRadius = '6px';
            el.style.border = '1px solid rgba(255, 255, 255, 0.2)';
          }}
          dayCellDidMount={(info) => {
            console.log('dayCellDidMount called, current view:', taskManagement.calendarView);
            
            // Force remove weekend styling
            const dayEl = info.el;
            const date = info.date;
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend days
              dayEl.style.setProperty('background-color', theme.background.primary, 'important');
              dayEl.style.setProperty('background', theme.background.primary, 'important');
              dayEl.style.opacity = '1';
              console.log('Removing weekend styling for:', date.toDateString());
            }
            
            // Only add "Add task" button in week view
            if (taskManagement.calendarView === 'dayGridWeek') {
              console.log('Adding Add task button for week view');
              const dayEl = info.el;
              const date = info.date;
              
              // Create add task button using theme-aware styling
              const addTaskBtn = document.createElement('button');
              addTaskBtn.innerHTML = '+ Add task';
              addTaskBtn.className = 'fc-add-task-btn';
              
              // Apply theme-aware styles
              Object.assign(addTaskBtn.style, {
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                padding: '8px',
                background: theme.background.secondary,
                border: `1px dashed ${theme.border.default}`,
                color: theme.text.secondary,
                fontSize: '11px',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: '100',
                opacity: '0.7',
                textAlign: 'center',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              });
              
              // Add hover effect using theme colors
              dayEl.addEventListener('mouseenter', () => {
                console.log('Day cell mouse enter - showing button');
                addTaskBtn.style.opacity = '1';
                addTaskBtn.style.background = theme.background.primary;
                addTaskBtn.style.borderColor = theme.text.secondary;
                addTaskBtn.style.color = theme.text.primary;
              });
              
              dayEl.addEventListener('mouseleave', () => {
                console.log('Day cell mouse leave - hiding button');
                addTaskBtn.style.opacity = '0.7';
                addTaskBtn.style.background = theme.background.secondary;
                addTaskBtn.style.borderColor = theme.border.default;
                addTaskBtn.style.color = theme.text.secondary;
              });
              
              // Add click handler
              addTaskBtn.addEventListener('click', (e) => {
                console.log('Add task button clicked for date:', date);
                e.stopPropagation();
                handleDateClick({ dateStr: date.toISOString().split('T')[0] });
              });
              
              // Make day cell relative positioned and set min height
              dayEl.style.position = 'relative';
              dayEl.style.minHeight = '120px';
              dayEl.appendChild(addTaskBtn);
              
              console.log('Add task button added to day cell');
            } else {
              console.log('Month view - no add task button needed');
            }
          }}
        />

        {/* Custom FullCalendar Styles */}
        <style jsx global>{`
          /* Hide FullCalendar header completely */
          .fc-header-toolbar {
            display: none !important;
          }
          
          .fc-toolbar {
            display: none !important;
          }
          
          .fc-toolbar-chunk {
            display: none !important;
          }

          /* FullCalendar custom styling */
          .fc {
            font-family: inherit;
          }
          
          /* Remove weekend overlay/styling - comprehensive selectors */
          .fc-day-sat,
          .fc-day-sun,
          .fc-daygrid-day.fc-day-sat,
          .fc-daygrid-day.fc-day-sun,
          .fc-day[data-date*="-sat"],
          .fc-day[data-date*="-sun"],
          .fc-daygrid-day[data-date*="-sat"],
          .fc-daygrid-day[data-date*="-sun"] {
            background-color: ${theme.background.primary} !important;
            opacity: 1 !important;
          }
          
          /* Remove any weekend-specific background or overlay */
          .fc .fc-daygrid-day.fc-day-sat::before,
          .fc .fc-daygrid-day.fc-day-sun::before,
          .fc-day-sat::before,
          .fc-day-sun::before {
            display: none !important;
          }
          
          /* Ensure weekend days have same styling as weekdays */
          .fc-daygrid-day.fc-day-sat,
          .fc-daygrid-day.fc-day-sun {
            background: ${theme.background.primary} !important;
            color: ${theme.text.primary} !important;
          }
          
          /* Override FullCalendar weekend classes */
          .fc-theme-standard .fc-scrollgrid .fc-daygrid-day.fc-day-sat,
          .fc-theme-standard .fc-scrollgrid .fc-daygrid-day.fc-day-sun {
            background-color: ${theme.background.primary} !important;
          }
          
          /* Remove any weekend styling from theme system */
          .fc-theme-standard td.fc-daygrid-day.fc-day-sat,
          .fc-theme-standard td.fc-daygrid-day.fc-day-sun,
          .fc-theme-standard .fc-daygrid-day.fc-day-sat,
          .fc-theme-standard .fc-daygrid-day.fc-day-sun {
            background-color: ${theme.background.primary} !important;
            background: ${theme.background.primary} !important;
          }
          
          /* Multi-day event styling */
          .fc-daygrid-event {
            border-radius: 4px !important;
            margin: 1px 0 !important;
            padding: 2px 6px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
          }
          
          .fc-daygrid-event-harness {
            margin-bottom: 2px !important;
          }
          
          /* Ensure multi-day events span properly */
          .fc-daygrid-event.fc-event-start {
            border-top-left-radius: 4px !important;
            border-bottom-left-radius: 4px !important;
          }
          
          .fc-daygrid-event.fc-event-end {
            border-top-right-radius: 4px !important;
            border-bottom-right-radius: 4px !important;
          }
          
          .fc-daygrid-event:not(.fc-event-start):not(.fc-event-end) {
            border-radius: 0 !important;
          }
          
          .fc-theme-standard .fc-scrollgrid {
            border-color: ${theme.border.default};
          }
          
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: ${theme.border.default};
          }
          
          .fc-col-header-cell {
            background-color: ${theme.background.secondary};
            color: ${theme.text.primary};
            font-weight: 600;
            padding: 12px 8px;
          }
          
          .fc-daygrid-day {
            background-color: ${theme.background.primary};
            color: ${theme.text.primary};
          }
          
          .fc-day-today {
            background-color: ${theme.background.secondary} !important;
          }
          
          .fc-daygrid-day-number {
            color: ${theme.text.primary};
            font-weight: 500;
            padding: 8px;
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
          
          .fc-timegrid-slot {
            color: ${theme.text.secondary};
            background-color: ${theme.background.primary};
          }
          
          .fc-timegrid-slot-minor {
            border-top-color: ${theme.border.default};
          }
          
          .fc-timegrid-slot-major {
            border-top-color: ${theme.border.default};
          }
          
          .fc-timegrid-axis {
            color: ${theme.text.secondary};
            background-color: ${theme.background.secondary};
          }
          
          .fc-event {
            border-radius: 6px !important;
            font-size: 12px;
            font-weight: 500;
            padding: 2px 6px;
            margin: 1px;
          }
          
          .fc-event:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            transition: all 0.2s ease;
          }
          
          .fc-more-link {
            color: ${theme.text.primary};
            background-color: ${theme.background.secondary};
            border: 1px solid ${theme.border.default};
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
          }
          
          .fc-more-link:hover {
            background-color: ${theme.background.primary};
            text-decoration: none;
          }
          
          .fc-daygrid-more-link {
            margin: 2px;
          }
          
          /* Week view specific styling */
          .fc-timegrid-event {
            border-radius: 4px !important;
          }
          
          .fc-timegrid-event-harness {
            margin: 0 2px;
          }
          
          /* All day events styling */
          .fc-daygrid-event {
            border-radius: 4px !important;
            margin: 1px 2px;
          }
          
          .fc-event-main {
            padding: 2px 4px;
          }
          
          .fc-event-title {
            font-weight: 500;
          }
        `}</style>
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={taskManagement.selectedTask}
        isOpen={taskManagement.isPanelOpen}
        onClose={taskManagement.closeTaskPanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </>
  );
};

export default MyTaskCalendarPage;